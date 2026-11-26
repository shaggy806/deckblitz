import { defineCard } from "../define.js";

// EDHREC rank 26975. Fa'adiyah Seer's ability, word for word.
const TEXT = "{T}: Draw a card and reveal it. If it isn't a land card, discard it.";

export default defineCard({
  name: "Sindbad",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "reveal-drawn" },
          { kind: "discard", target: "you", amount: 1, filter: { thisWay: "drawn", notTypes: ["land"] } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
