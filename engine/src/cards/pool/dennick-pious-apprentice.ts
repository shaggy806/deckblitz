import { defineCard } from "../define.js";

export default defineCard({
  name: "Dennick, Pious Apprentice",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  disturb: { cost: "{2}{W}{U}" },
  text: "Lifelink\nCards in graveyards can't be the targets of spells or abilities.\nDisturb {2}{W}{U} (You may cast this card from your graveyard transformed for its disturb cost.)",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-targeted", object: { inZone: "graveyard" } }],
      text: "Cards in graveyards can't be the targets of spells or abilities.",
    },
  ],
  faces: ["Dennick, Pious Apprentice", "Dennick, Pious Apparition"],
  transform: true,
});
