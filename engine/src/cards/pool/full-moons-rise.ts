import { defineCard } from "../define.js";

const LORD_TEXT = "Werewolf creatures you control get +1/+0 and have trample.";
const REGEN_TEXT = "Sacrifice this enchantment: Regenerate all Werewolf creatures you control.";

// Sacrificing it ends the +1/+0 and trample before the regeneration shields
// are used (the ruling) — the static simply stops applying.
export default defineCard({
  name: "Full Moon's Rise",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${LORD_TEXT}\n${REGEN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Werewolf", controlledBy: "you" } },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "regenerate-all", filter: { type: "creature", subtype: "Werewolf", controlledBy: "you" } },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
});
