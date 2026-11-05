import { defineCard } from "../define.js";

// "Any amount": the number is chosen as it resolves, up to the life they have
// (rule 119.4), then paid. Nobody can act between the two.
const SKIP_TEXT = "Skip your draw step.";
const END_TEXT = "At the beginning of your end step, you may pay any amount of life. If you do, draw that many cards.";
const HAND_TEXT = "Your maximum hand size is five.";
const EXILE_TEXT = "If a card or token would be put into your graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Necrodominance",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${SKIP_TEXT}\n${END_TEXT}\n${HAND_TEXT}\n${EXILE_TEXT}`,
  static: [
    { affects: { scope: "self" }, skipsSteps: { who: "you", steps: ["draw"] }, text: SKIP_TEXT },
    { affects: { scope: "self" }, maxHandSize: { who: "you", set: 5 }, text: HAND_TEXT },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you" } },
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "choose-value",
        value: "number",
        min: 0,
        max: { lifeTotal: "you" },
        prompt: "How much life will you pay?",
        then: {
          kind: "may",
          prompt: "Pay that much life to draw that many cards?",
          costLife: "x",
          effect: { kind: "draw", amount: "x" },
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
