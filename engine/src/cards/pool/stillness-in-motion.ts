import { defineCard } from "../define.js";

// EDHREC rank 10847.
//
// The "then if" is asked after the mill (Jace, Wielder of Mysteries' shape).
// The five go on top in the order they're picked, the first on top — "in any
// order"; with fewer than five in the graveyard, all of them.

const TEXT =
  "At the beginning of your upkeep, mill three cards. Then if your library has no cards in it, exile this enchantment and put five cards from your graveyard on top of your library in any order.";

export default defineCard({
  name: "Stillness in Motion",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "library-size", who: "you", atMost: 0 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: "source" },
                {
                  kind: "look-and-choose",
                  zone: "graveyard",
                  min: 5,
                  max: 5,
                  destination: "library-top",
                  leftover: "stay",
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
