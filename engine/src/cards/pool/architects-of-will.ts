import { defineCard } from "../define.js";

// EDHREC rank 20740.

const TEXT = "When this creature enters, look at the top three cards of target player's library, then put them back in any order.";

export default defineCard({
  name: "Architects of Will",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  cycling: { cost: "{U/B}" },
  text: `${TEXT}\nCycling {U/B} ({U/B}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      // Every one of them picked, in the order they go back on top.
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 3,
        min: 3,
        max: 3,
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
