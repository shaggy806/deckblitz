import { defineCard } from "../define.js";
import { craft, equip } from "../helpers.js";

// EDHREC rank 14261.
export default defineCard({
  name: "Dire Flail",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+0.\nEquip {1}\nCraft with artifact {3}{R}{R} ({3}{R}{R}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  activated: [
    equip("{1}"),
    craft("{3}{R}{R}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {3}{R}{R}"),
  ],
  faces: ["Dire Flail", "Dire Blunderbuss"],
  transform: true,
});
