import { defineCard } from "../define.js";

// EDHREC rank 8591.

export default defineCard({
  name: "Family's Favor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever you attack, put a shield counter on target attacking creature. Until end of turn, it gains \"Whenever this creature deals combat damage to a player, remove a shield counter from it. If you do, draw a card.\" (If a creature with a shield counter on it would be dealt damage or destroyed, remove a shield counter from it instead.)",
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "deals-combat-damage-to-player", who: "self" },
              targets: [],
              // "If you do": only with a shield counter there to remove.
              effect: {
                kind: "conditional",
                condition: { kind: "self-counters", counter: "shield", compare: { op: "gte", n: 1 } },
                then: {
                  kind: "sequence",
                  effects: [
                    { kind: "remove-counter", target: "source", counter: "shield", amount: 1 },
                    { kind: "draw", amount: 1 },
                  ],
                },
              },
              resolve: null,
              text: "Whenever this creature deals combat damage to a player, remove a shield counter from it. If you do, draw a card.",
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever you attack, put a shield counter on target attacking creature. Until end of turn, it gains \"Whenever this creature deals combat damage to a player, remove a shield counter from it. If you do, draw a card.\"",
    },
  ],
});
