import { defineCard } from "../define.js";

export default defineCard({
  name: "Cavalier of Gales",
  manaCost: "{2}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Knight"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text:
    "Flying\n" +
    "When this creature enters, draw three cards, then put two cards from your hand on top of your library in any order.\n" +
    "When this creature dies, shuffle it into its owner's library, then scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: "When this creature enters, draw three cards, then put two cards from your hand on top of your library in any order.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-into-library", target: "trigger-object" },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this creature dies, shuffle it into its owner's library, then scry 2.",
    },
  ],
});
