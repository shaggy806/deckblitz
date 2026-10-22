import { defineCard } from "../define.js";

// The aftermath half of Driven // Despair: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Driven // Despair", "Driven", "Despair"];
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Despair",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nUntil end of turn, creatures you control gain menace and \"Whenever this creature deals combat damage to a player, that player discards a card.\"",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: YOURS, keyword: "menace", duration: "end-of-turn" },
      {
        kind: "grant-triggered-all",
        filter: YOURS,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "discard", target: "trigger-player", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, that player discards a card.",
        },
      },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
