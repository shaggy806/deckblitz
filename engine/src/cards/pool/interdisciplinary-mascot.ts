import { defineCard } from "../define.js";

// EDHREC rank 15156. March of the Machine Commander.

const ENTERS_TEXT =
  "When this creature enters, look at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Interdisciplinary Mascot",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Fractal"],
  power: 5,
  toughness: 5,
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nWard {3}\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
