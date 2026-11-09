import { defineCard } from "../define.js";

// Rule 103.6b: the reveal sets up one delayed ability a card; `your-next-upkeep`
// made before turn 1 fires at its owner's first upkeep.

const REVEAL =
  "You may reveal this card from your opening hand. If you do, at the beginning of your first upkeep, look at the top four cards of your library. You may put one of those cards back on top of your library. Exile the rest.";

export default defineCard({
  name: "Devourer of Destiny",
  manaCost: "{5}{C}{C}",
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 6,
  toughness: 6,
  text: `${REVEAL}\nWhen you cast this spell, exile target permanent that's one or more colors.`,
  openingHandReveal: {
    at: { step: "upkeep", whose: "you" },
    effect: {
      kind: "look-and-choose",
      zone: "library",
      count: 4,
      min: 0,
      max: 1,
      destination: "library-top",
      leftover: "exile",
    },
    text: REVEAL,
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        {
          kind: "permanent",
          filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }] },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When you cast this spell, exile target permanent that's one or more colors.",
    },
  ],
});
