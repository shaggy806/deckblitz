import { defineCard } from "../define.js";

// EDHREC rank 15326.

export default defineCard({
  name: "Sonic Shrieker",
  manaCost: "{2}{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, it deals 2 damage to any target and you gain 2 life. If a player is dealt damage this way, they discard a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
          // A player was the target and the damage wasn't prevented.
          {
            kind: "conditional",
            condition: { kind: "damage-dealt-this-way", to: 0, player: true },
            then: { kind: "discard", target: 0, amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to any target and you gain 2 life. If a player is dealt damage this way, they discard a card.",
    },
  ],
});
