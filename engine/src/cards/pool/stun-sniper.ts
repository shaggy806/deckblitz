import { defineCard } from "../define.js";

// EDHREC rank 22392.

const TEXT = "{1}, {T}: This creature deals 1 damage to target creature. Tap that creature.";

export default defineCard({
  name: "Stun Sniper",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "tap", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
