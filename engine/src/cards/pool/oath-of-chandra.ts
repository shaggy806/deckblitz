import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] Oath of Chandra's last ability will trigger even if the planeswalker that entered
//     the battlefield under your control is no longer on the battlefield, no longer under your
//     control, or no longer a planeswalker. This is also true if Oath of Chandra wasn't on the
//     battlefield when the planeswalker entered.
//   [2016-01-22] The last ability triggers only once per turn, even if more than one planeswalker
//     entered the battlefield under your control.

const ENTER_TEXT = "When Oath of Chandra enters, it deals 3 damage to target creature an opponent controls.";
const END_TEXT =
  "At the beginning of each end step, if a planeswalker entered the battlefield under your control this turn, Oath of Chandra deals 2 damage to each opponent.";

export default defineCard({
  name: "Oath of Chandra",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "planeswalker" } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
