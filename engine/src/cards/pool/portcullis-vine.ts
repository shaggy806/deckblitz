import { defineCard } from "../define.js";

// EDHREC rank 15349. Guilds of Ravnica. It can be sacrificed to its own cost
// (the ruling).

export default defineCard({
  name: "Portcullis Vine",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{2}, {T}, Sacrifice a creature with defender: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "creature", keyword: "defender" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, {T}, Sacrifice a creature with defender: Draw a card.",
    },
  ],
});
