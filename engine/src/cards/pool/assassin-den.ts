import { defineCard } from "../define.js";

// EDHREC rank 16390.

const ABILITY =
  "{3}{U}: Put a +1/+1 counter on target creature you control. It can't be blocked this turn. Activate only as a sorcery.";

export default defineCard({
  name: "Assassin Den",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 2,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${ABILITY}`,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ABILITY,
      sorcerySpeed: true,
    },
  ],
});
