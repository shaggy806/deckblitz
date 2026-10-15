import { defineCard } from "../define.js";

// EDHREC rank 15666.

const PUMP_TEXT =
  "Discard a card: This creature gets +1/+0 and gains menace until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Inner Demons Gangsters",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 3,
  toughness: 4,
  text: `${PUMP_TEXT} (It can't be blocked except by two or more creatures.)`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
      sorcerySpeed: true,
    },
  ],
});
