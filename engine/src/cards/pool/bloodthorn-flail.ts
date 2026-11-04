import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const EQUIPPED_TEXT = "Equipped creature gets +2/+1.";

export default defineCard({
  name: "Bloodthorn Flail",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${EQUIPPED_TEXT}\nEquip—Pay {3} or discard a card.`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: EQUIPPED_TEXT }],
  // One ability with a choice of two whole costs: an entry for each, which the
  // player picks by which they activate. Nothing tells that from one ability.
  activated: [
    equip("{3}"),
    { ...equip("{0}"), cost: { mana: null, tap: false, discard: { count: 1 } }, text: "Equip—Discard a card" },
  ],
});
