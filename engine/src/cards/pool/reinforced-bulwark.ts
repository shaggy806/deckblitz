import { defineCard } from "../define.js";

// EDHREC rank 26506.

export default defineCard({
  name: "Reinforced Bulwark",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\n{T}: Prevent the next 1 damage that would be dealt to you this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to you this turn.",
    },
  ],
});
