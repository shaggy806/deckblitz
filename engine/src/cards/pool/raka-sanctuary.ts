import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// Apocalypse (APC). EDHREC rank 30616.
//
// Rulings:
//   [2004-10-04] It can deal 1 or 3 damage, but never 4.
//
// The intervening if (rule 603.4) is "a white or blue permanent"; the 3 replaces the 1 when
// both are there as it resolves.
const TEXT =
  "At the beginning of your upkeep, if you control a white or blue permanent, this enchantment deals 1 damage to target creature. If you control a white permanent and a blue permanent, this enchantment deals 3 damage instead.";
const WHITE: StaticCondition = { kind: "controls", filter: { colors: ["W"] }, atLeast: 1, countsSelf: true };
const BLUE: StaticCondition = { kind: "controls", filter: { colors: ["U"] }, atLeast: 1, countsSelf: true };

export default defineCard({
  name: "Raka Sanctuary",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "any", of: [WHITE, BLUE] },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: { kind: "all", of: [WHITE, BLUE] },
        then: { kind: "damage", amount: 3, target: 0 },
        else: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
