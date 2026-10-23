import { defineCard } from "../define.js";

// EDHREC rank 10491.
//
// Rulings:
//   [2016-07-13] The last ability triggers only once per turn, even if more than one planeswalker
//     entered the battlefield under your control.
//   [2016-07-13] Oath of Liliana's last ability will trigger even if the planeswalker that
//     entered the battlefield under your control is no longer on the battlefield, no longer under
//     your control, or no longer a planeswalker. This is also true if Oath of Liliana wasn't on
//     the battlefield when the planeswalker entered.
//
// The intervening-if reads your turn history's "entered" list (Wary Farmer),
// which records each entry as it happened, so a planeswalker that has since
// left, or one that entered before the Oath, still counts.

const END_TEXT =
  "At the beginning of each end step, if a planeswalker entered the battlefield under your control this turn, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Oath of Liliana",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `When Oath of Liliana enters, each opponent sacrifices a creature of their choice.\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "When Oath of Liliana enters, each opponent sacrifices a creature of their choice.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "planeswalker" } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
