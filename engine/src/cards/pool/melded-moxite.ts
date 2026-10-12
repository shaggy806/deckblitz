import { defineCard } from "../define.js";

export default defineCard({
  name: "Melded Moxite",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: "When this artifact enters, you may discard a card. If you do, draw two cards.\n{3}, Sacrifice this artifact: Create a tapped 2/2 colorless Robot artifact creature token.",
  activated: [
    {
      cost: { mana: "{3}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token", count: 1, tapped: true },
      resolve: null,
      text: "{3}, Sacrifice this artifact: Create a tapped 2/2 colorless Robot artifact creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: "When this artifact enters, you may discard a card. If you do, draw two cards.",
    },
  ],
});
