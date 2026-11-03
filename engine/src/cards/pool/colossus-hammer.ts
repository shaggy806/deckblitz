import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "Loses flying" applies at the Hammer's timestamp, which is when it became
// attached (rule 613.7e): flying the creature had before — printed, or from
// an "as long as" static of its own — is gone; flying granted after it
// isn't (the rulings).

const EQUIPPED_TEXT = "Equipped creature gets +10/+10 and loses flying.";

export default defineCard({
  name: "Colossus Hammer",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${EQUIPPED_TEXT}\nEquip {8}`,
  static: [{ affects: { scope: "attached" }, grantPt: [10, 10], loseKeywords: ["flying"], text: EQUIPPED_TEXT }],
  activated: [equip("{8}")],
});
