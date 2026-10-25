import { defineCard } from "../define.js";

// EDHREC rank 10491.
//
// Rulings:
//   - The last ability triggers only once per turn, even if more than one
//     planeswalker entered the battlefield under your control.
//   - It triggers even if the planeswalker that entered is no longer on the
//     battlefield, no longer under your control, or no longer a planeswalker,
//     and even if Oath of Liliana wasn't on the battlefield when it entered.
//
// "Each end step" is `who: "any"`; the intervening-if reads the turn's
// `entered` history, matched as each permanent entered (`asEntered`) — so a
// planeswalker gone since, or Oath arriving after it, still counts.

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
