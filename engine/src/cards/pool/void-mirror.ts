import { defineCard } from "../define.js";

// "No colored mana was spent" is "not one unit of any of the five colours"
// over the spell's `manaSpentByColor` — a free cast, or one paid only with
// colourless mana, is countered.
const TEXT = "Whenever a player casts a spell, if no colored mana was spent to cast it, counter that spell.";

export default defineCard({
  name: "Void Mirror",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      condition: {
        kind: "not",
        of: {
          kind: "any",
          of: [
            { kind: "trigger-object", filter: { manaSpent: [{ type: "W", amount: { op: "gte", n: 1 } }] } },
            { kind: "trigger-object", filter: { manaSpent: [{ type: "U", amount: { op: "gte", n: 1 } }] } },
            { kind: "trigger-object", filter: { manaSpent: [{ type: "B", amount: { op: "gte", n: 1 } }] } },
            { kind: "trigger-object", filter: { manaSpent: [{ type: "R", amount: { op: "gte", n: 1 } }] } },
            { kind: "trigger-object", filter: { manaSpent: [{ type: "G", amount: { op: "gte", n: 1 } }] } },
          ],
        },
      },
      targets: [],
      effect: { kind: "counter", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
