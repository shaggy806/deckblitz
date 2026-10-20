import { defineCard } from "../define.js";

export default defineCard({
  name: "Jarl of the Forsaken",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, destroy target creature or planeswalker an opponent controls that was dealt damage this turn.\nForetell {1}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
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
      text: "When this creature enters, destroy target creature or planeswalker an opponent controls that was dealt damage this turn.",
    },
  ],
  foretell: { cost: "{1}{B}" },
});
