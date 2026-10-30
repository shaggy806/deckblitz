import { defineCard } from "../define.js";
import { CHOSEN_COUNTER } from "../../effects.js";

// Rulings:
//   Only one loyalty ability of each planeswalker may be activated per turn, no matter how many
//     it has gained.
//
// The kind of counter is chosen as the trigger resolves (`choose-value`),
// among those on the target then; with none on it, nothing happens.

const PROLIFERATE = "[0]: Proliferate";
const EXTRA_TURN = "[−12]: Take an extra turn after this one.";
const GRANTS = `Planeswalkers you control have "${PROLIFERATE}" and "${EXTRA_TURN}"`;
const TRIGGER =
  "Whenever you cast a noncreature spell, choose a counter on target permanent. Put an additional counter of that kind on that permanent.";

export default defineCard({
  name: "Ichormoon Gauntlet",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${GRANTS}\n${TRIGGER}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: 0,
          cost: { tap: false, mana: null },
          targets: [],
          effect: { kind: "proliferate" },
          resolve: null,
          text: "0: Proliferate",
        },
        {
          loyaltyCost: -12,
          cost: { tap: false, mana: null },
          targets: [],
          effect: { kind: "take-extra-turn" },
          resolve: null,
          text: "−12: Take an extra turn after this one.",
        },
      ],
      text: GRANTS,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: ["permanent"],
      effect: {
        kind: "choose-value",
        value: "counter-kind",
        on: 0,
        then: { kind: "add-counter", target: 0, counter: CHOSEN_COUNTER, amount: 1 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
