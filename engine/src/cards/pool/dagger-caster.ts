import { defineCard } from "../define.js";

export default defineCard({
  name: "Dagger Caster",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Rogue"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, it deals 1 damage to each opponent and 1 damage to each creature your opponents control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
        ],
      },
      resolve: null,
      text: "When this creature enters, it deals 1 damage to each opponent and 1 damage to each creature your opponents control.",
    },
  ],
});
