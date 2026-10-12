import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, create a token that's a copy of this creature.";

export default defineCard({
  name: "Colorstorm Stallion",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Horse"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Ward {1}, haste\n${OPUS_TEXT}`,
  triggered: [
    ward({ mana: "{1}" }),
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
            then: { kind: "create-token-copy", of: "source", count: 1 },
          },
        ],
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
