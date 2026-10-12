import { defineCard } from "../define.js";

const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, put a +1/+1 counter on this creature. If five or more mana was spent to cast that spell, add an amount of {R} equal to this creature's power.";

// Not a mana ability: it triggers on a cast and uses the stack (the ruling).
export default defineCard({
  name: "Molten-Core Maestro",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Bard"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${OPUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
            then: { kind: "add-mana", mana: "R", amount: { powerOf: "source" } },
          },
        ],
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
