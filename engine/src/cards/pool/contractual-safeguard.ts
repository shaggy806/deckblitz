import { CHOSEN_COUNTER } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings:
//   If you cast this spell during your main phase, you may choose the shield counter for the second
//     part of the spell.
//
// "Each other creature" is other than the creature whose counter was chosen: the kind is asked
// first (`among` the creatures you control), then which creature with that kind it was, asked only
// where several have it, since that one alone goes without.

const ADDENDUM =
  "Addendum — If you cast this spell during your main phase, put a shield counter on a creature you control. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)";
const CHOOSE = "Choose a kind of counter on a creature you control. Put a counter of that kind on each other creature you control.";

export default defineCard({
  name: "Contractual Safeguard",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${ADDENDUM}\n${CHOOSE}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source", filter: { cast: true } },
            { kind: "your-turn" },
            { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
          ],
        },
        then: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose a creature you control to put a shield counter on",
          then: { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
        },
      },
      {
        kind: "choose-value",
        value: "counter-kind",
        among: { type: "creature", controlledBy: "you" },
        then: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you", counters: { kind: CHOSEN_COUNTER, compare: { op: "gte", n: 1 } } },
          min: 1,
          upTo: 1,
          prompt: "Choose the creature with that counter: each other creature you control gets one",
          then: {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you" },
            exceptTarget: 0,
            counter: CHOSEN_COUNTER,
            amount: 1,
          },
        },
      },
    ],
  },
});
