import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, look at the top three cards of your library, then put them back in any order. You may shuffle. Draw a card.";

export default defineCard({
  name: "Pondering Mage",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 3,
            min: 3,
            max: 3,
            destination: "library-top",
            leftover: "stay",
          },
          { kind: "may", prompt: "Shuffle your library?", effect: { kind: "shuffle-library" } },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
