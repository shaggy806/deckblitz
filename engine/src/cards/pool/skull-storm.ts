import { defineCard } from "../define.js";

const COPY_TEXT =
  "When you cast this spell, copy it for each time you've cast your commander from the command zone this game.";
const SPELL_TEXT =
  "Each opponent sacrifices a creature of their choice. Each opponent who can't loses half their life, rounded up.";

export default defineCard({
  name: "Skull Storm",
  manaCost: "{7}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\n${SPELL_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", count: { commanderCasts: "you" } },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "conditional",
          condition: { kind: "this-way", what: "sacrificed", who: "that-player", atMost: 0 },
          then: { kind: "lose-life", who: "that-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
        },
      },
    ],
  },
});
