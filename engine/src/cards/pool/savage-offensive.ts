import { defineCard } from "../define.js";

// EDHREC rank 25682. Only the creatures you control as it resolves are
// affected (the ruling) — both `-all` effects read the battlefield then.
// Kicked, the same creatures also get +1/+1.
const FIRST_STRIKE = {
  kind: "grant-keyword-all",
  filter: { type: "creature", controlledBy: "you" },
  keyword: "first-strike",
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Savage Offensive",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker {G} (You may pay an additional {G} as you cast this spell.)\nCreatures you control gain first strike until end of turn. If this spell was kicked, they get +1/+1 until end of turn.",
  targets: [],
  effect: FIRST_STRIKE,
  kicker: {
    cost: "{G}",
    effect: {
      kind: "sequence",
      effects: [
        FIRST_STRIKE,
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 1,
          duration: "end-of-turn",
        },
      ],
    },
  },
});
