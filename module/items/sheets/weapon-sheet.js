import  { COC7 } from "../../config.js"

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class CoC7WeaponSheet extends ItemSheet {
	constructor(...args) {
		super(...args);
	}

	/**
	 * 
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["coc7", "sheet", "item"],
			width: 520,
			height: 480,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills"}]
		});
	}

	/**
	 * 
	 */
	get template() {
		const path = "systems/CoC7/templates/items";
		return `${path}/weapon-sheet.html`;
	}

	/**
	 * Prepare data for rendering the Item sheet
	 * The prepared data object contains both the actor data as well as additional sheet options
	 */
	getData() {
		const data = super.getData();
		data.dtypes = ["String", "Number", "Boolean"];

		data.hasOwner = this.item.actor != null;

		data.combatSkill = [];
		if( data.hasOwner) {
			data.combatSkill = this.item.actor.items.filter( item =>{ 
				if( item.type == "skill")
				{
					if( item.data.data.properties.combat)
					{
						return true;
					}
				}
				return false;
			});
		
			data.combatSkill.sort((a, b) =>{
				let lca;
				let lcb;
				if( a.data.properties && b.data.properties) {
					lca = a.data.properties.special ? a.data.specialization.toLowerCase() + a.name.toLowerCase() : a.name.toLowerCase();
					lcb = b.data.properties.special ? b.data.specialization.toLowerCase() + b.name.toLowerCase() : b.name.toLowerCase();
				}
				else {
					lca = a.name.toLowerCase();
					lcb = b.name.toLowerCase();
				}
				if( lca < lcb) return -1;
				if( lca > lcb) return 1;
				return 0;
			});
		}


		data._properties = [];
		for( let [key, value] of Object.entries(COC7["weaponProperties"]))
		{
			let property = {};
			property.id = key;
			property.name = value;
			property.isEnabled = this.item.data.data.properties[key] == true;
			data._properties.push(property);
		}

		if(!this.item.data.data.price) this.item.data.data.price = {};

		data._eras = [];
		for( let [key, value] of Object.entries(COC7["eras"]))
		{
			let era = {};
			if( !this.item.data.data.price[key]) this.item.data.data.price[key]=0;
			era.price = this.item.data.data.price[key];
			era.id = key;
			era.name = value;
			era.isEnabled = this.item.data.data.eras[key] == true;
			data._eras.push(era);
		}
		data.usesAlternateSkill = this.item.data.data.properties.auto == true;

		return data;
	}

	/* -------------------------------------------- */

	/**
	 * Activate event listeners using the prepared sheet HTML
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html) {
		super.activateListeners(html);


		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Add or Remove Attribute
		// html.find(".attributes").on("click", ".attribute-control", this._onClickAttributeControl.bind(this));

		html.find('.toggle-switch').click(this._onClickToggle.bind(this));
	}

	/**
	 * 
	 * @param {*} event 
	 */
	async _onClickToggle(event) {
		event.preventDefault();
		const propertyId = event.currentTarget.closest(".toggle-switch").dataset.property;
		const set = event.currentTarget.parentElement.dataset.set;
		const elementName = set + "-" + propertyId;
		const checkboxControl = this.form.elements.namedItem(elementName);

		if( checkboxControl.checked) checkboxControl.checked = false; else checkboxControl.checked = true;

		event.target.classList.toggle("switched-on");
		await this._onSubmit(event);
	}

}
