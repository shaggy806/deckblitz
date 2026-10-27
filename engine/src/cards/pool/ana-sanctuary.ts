import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// EDHREC rank 18529.
//
// Rulings:
//   The creature either gets +1/+1 or +5/+5, never +6/+6.

const TEXT =
  "At the beginning of your upkeep, if you control a blue or black permanent, target creature gets +1/+1 until end of turn. If you control a blue permanent and a black permanent, that creature gets +5/+5 until end of turn instead.";

const BLUE: StaticCondition = { kind: "controls", filter: { colors: ["U"] }, atLeast: 1 };
const BLACK: StaticCondition = { kind: "controls", filter: { colors: ["B"] }, atLeast: 1 };
const BOTH = { ifCondition: { kind: "all", of: [BLUE, BLACK] }, then: 5, else: 1 } as const;

export default defineCard({
  name: "Ana Sanctuary",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "any", of: [BLUE, BLACK] },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: BOTH, toughness: BOTH, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
