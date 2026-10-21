import { defineCard } from "../define.js";

// EDHREC rank 8605. Battlebond.
//
// "If you do" is the discard having happened (Green Goblin, Back for More's
// `this-way` gate). "Choose a creature" isn't a target: any creature, chosen
// as this resolves (`choose-permanents`), and the delayed "whenever that
// creature deals combat damage to a player this turn" is keyed to it
// (Captain Howler, Sea Scourge's shape).
const TEXT =
  "At the beginning of combat on your turn, you may discard a card. If you do, choose a creature. Whenever that creature deals combat damage to a player this turn, you draw two cards.";

export default defineCard({
  name: "Azra Oddsmaker",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Azra", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to choose a creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "choose-permanents",
                filter: { type: "creature" },
                min: 1,
                upTo: 1,
                prompt: "Choose a creature",
                then: {
                  kind: "delayed-trigger",
                  at: { dealsCombatDamage: 0 },
                  effect: { kind: "draw", amount: 2 },
                  text: "Whenever that creature deals combat damage to a player this turn, you draw two cards.",
                },
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
