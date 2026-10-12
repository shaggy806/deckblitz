import { defineCard } from "../define.js";

// EDHREC rank 7267.
//
// Rulings:
//   [2025-09-19] If multiple effects modify your hand size, apply them in timestamp order. For
//     example, if you put Spellbook (an artifact that says you have no maximum hand size) onto the
//     battlefield and then put Doctor Octopus, Master Planner onto the battlefield, your maximum
//     hand size will be eight. However, if those permanents entered in the opposite order, you
//     would have no maximum hand size.
//   [2025-09-19] The number of cards you ultimately draw may be affected by replacement effects.
//     For example, if you have six cards in hand as Doctor Octopus's last ability resolves, and
//     you also control Thought Reflection (an enchantment that says "If you would draw a card,
//     draw two cards instead"), you'll end up drawing four cards.
//   [2025-09-19] Your maximum hand size is checked only during the cleanup step of your turn. At
//     any other time, you may have any number of cards in hand.

// The Squadron Sinister's Villain anthem; The Ten Rings' hand size and
// end-step refill at eight (`maxHandSizeOf` applies hand-size changes in
// timestamp order, the first ruling).
const ANTHEM_TEXT = "Other Villains you control get +2/+2.";
const HAND_TEXT = "Your maximum hand size is eight.";
const DRAW_TEXT =
  "At the beginning of your end step, if you have fewer than eight cards in hand, draw cards equal to the difference.";

export default defineCard({
  name: "Doctor Octopus, Master Planner",
  manaCost: "{5}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 4,
  toughness: 8,
  text: `${ANTHEM_TEXT}\n${HAND_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Villain", controlledBy: "you" }, excludeSelf: true },
      grantPt: [2, 2],
      text: ANTHEM_TEXT,
    },
    { affects: { scope: "self" }, maxHandSize: { who: "you", set: 8 }, text: HAND_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "hand-size", atMost: 7 },
      targets: [],
      effect: { kind: "draw", amount: { difference: [8, { cardsInHand: "you" }] } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
