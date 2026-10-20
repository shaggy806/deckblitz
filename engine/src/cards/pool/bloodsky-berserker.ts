import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast your second spell each turn, put two +1/+1 counters on this creature. It gains menace until end of turn.";

export default defineCard({
  name: "Bloodsky Berserker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 1,
  text: `${TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
