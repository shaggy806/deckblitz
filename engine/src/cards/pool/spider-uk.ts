import { defineCard } from "../define.js";

// EDHREC rank 9059.

const END_TEXT =
  "At the beginning of your end step, if two or more creatures entered the battlefield under your control this turn, you draw a card and gain 2 life.";

export default defineCard({
  name: "Spider-UK",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 4,
  webSlinging: { cost: "{2}{W}" },
  text: `Web-slinging {2}{W} (You may cast this spell for {2}{W} if you also return a tapped creature you control to its owner's hand.)\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // An intervening if (rule 603.4): asked as the step begins and again as it resolves.
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, atLeast: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
