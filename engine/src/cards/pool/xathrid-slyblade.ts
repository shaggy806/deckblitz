import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 26308.

const TEXT = "{3}{B}: Until end of turn, this creature loses hexproof and gains first strike and deathtouch.";

export default defineCard({
  name: "Xathrid Slyblade",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\n{3}{B}: Until end of turn, this creature loses hexproof and gains first strike and deathtouch. (It deals combat damage before creatures without first strike. Any amount of damage it deals to a creature is enough to destroy it.)",
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-keywords", target: "source", keywords: ["hexproof"], duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
