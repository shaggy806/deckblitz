import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, destroy target creature or planeswalker an opponent controls that was dealt damage this turn.";

export default defineCard({
  name: "Vraska's Finisher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon", "Assassin"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"], damagedThisTurnBy: {} },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
