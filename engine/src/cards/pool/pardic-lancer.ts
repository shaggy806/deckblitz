import { defineCard } from "../define.js";

// EDHREC rank 31281. Torment.

export default defineCard({
  name: "Pardic Lancer",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 3,
  toughness: 2,
  text: "Discard a card at random: This creature gets +1/+0 and gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, random: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Discard a card at random: This creature gets +1/+0 and gains first strike until end of turn.",
    },
  ],
});
