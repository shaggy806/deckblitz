import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals combat damage to a player, if you control a blue or red permanent, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Wandering Champion",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: {
        kind: "controls",
        filter: { anyOf: [{ colors: ["U"] }, { colors: ["R"] }] },
        atLeast: 1,
        countsSelf: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
