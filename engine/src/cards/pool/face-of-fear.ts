import { defineCard } from "../define.js";

// EDHREC rank 31782.

const TEXT =
  "{2}{B}, Discard a card: This creature gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)";

export default defineCard({
  name: "Face of Fear",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "fear", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
