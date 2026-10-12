import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 16391.
export default defineCard({
  name: "Plasma Bolt",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Plasma Bolt deals 2 damage to any target.\n" +
    "Void — Plasma Bolt deals 3 damage instead if a nonland permanent left the battlefield this turn or a spell was warped this turn.",
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { ifCondition: VOID_CONDITION, then: 3, else: 2 } },
});
