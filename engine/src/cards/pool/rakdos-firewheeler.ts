import { defineCard } from "../define.js";

export default defineCard({
  name: "Rakdos Firewheeler",
  manaCost: "{B}{B}{R}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 3,
  text: "When this creature enters, it deals 2 damage to target opponent and 2 damage to up to one target creature or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        "opponent",
        { kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "damage", amount: 2, target: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to target opponent and 2 damage to up to one target creature or planeswalker.",
    },
  ],
});
