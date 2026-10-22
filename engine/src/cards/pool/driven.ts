import { defineCard } from "../define.js";

// The half of Driven // Despair cast from the hand.
const FACES = ["Driven // Despair", "Driven", "Despair"];
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Driven",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Until end of turn, creatures you control gain trample and \"Whenever this creature deals combat damage to a player, draw a card.\"",
  targets: [],
  // Only the creatures you control as it resolves (the ruling): both grants
  // fix their matches then (rule 611.2c).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: YOURS, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "grant-triggered-all",
        filter: YOURS,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, draw a card.",
        },
      },
    ],
  },
  faces: FACES,
  split: true,
});
