import { defineCard } from "../define.js";

const TAX = "As long as Kaervek's Torch is on the stack, spells that target it cost {2} more to cast.";
const DAMAGE = "Kaervek's Torch deals X damage to any target.";

export default defineCard({
  name: "Kaervek's Torch",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${TAX}\n${DAMAGE}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: "x", target: 0 },
  static: [{ affects: { scope: "self" }, targetedBySpellsCost: { payGeneric: 2, whileOnStack: true }, text: TAX }],
});
