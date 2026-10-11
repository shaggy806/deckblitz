import { defineCard } from "../define.js";

// EDHREC rank 8019.
//
// Once per opponent per turn: each opponent's own second draw.
const TEXT =
  "Whenever an opponent draws their second card each turn, put a +1/+1 counter on Black Widow and you draw a card.";

export default defineCard({
  name: "Black Widow, Agile Avenger",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "opponent", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
