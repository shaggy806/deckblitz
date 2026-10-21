import { defineCard } from "../define.js";

// EDHREC rank 23398.

const TEXT =
  "{7}: This creature gets +2/+0 and gains trample until end of turn. It can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Roving Keep",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 5,
  toughness: 7,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          { kind: "attack-despite-defender", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
