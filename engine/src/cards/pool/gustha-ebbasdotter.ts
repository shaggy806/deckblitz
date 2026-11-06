import { defineCard } from "../define.js";

// Mystery Booster Commander. "Your first spell during each opponent's turn":
// the first spell you cast in a turn that isn't yours.
const TEXT =
  "Whenever you cast your first spell during each opponent's turn, draw three cards, then put two cards from your hand on top of your library in any order.";

export default defineCard({
  name: "Gustha Ebbasdotter",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `Protection from red\n${TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true },
      whileCondition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
