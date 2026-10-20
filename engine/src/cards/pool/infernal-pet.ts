import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 26201.
const TEXT =
  "Whenever you cast your second spell each turn, put a +1/+1 counter on this creature and it gains flying until end of turn.";

export default defineCard({
  name: "Infernal Pet",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
