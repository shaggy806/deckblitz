import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may sacrifice another nonland permanent. When you do, this creature deals 2 damage to any target.";

export default defineCard({
  name: "Dahar Master",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { notTypes: ["land"] },
            exceptSource: true,
            text: "Sacrifice another nonland permanent",
          },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0 },
          text: "When you do, this creature deals 2 damage to any target.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
