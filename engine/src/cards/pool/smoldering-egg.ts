import { defineCard } from "../define.js";

// EDHREC rank 10663. A transforming double-faced card; the back face is
// Ashmouth Dragon. "The amount of mana spent to cast that spell" is the cast
// spell's (`manaSpentOf: "trigger-object"`); the threshold is checked after the
// counters go on, and only then are they all removed (Strixhaven Stadium's
// shape).

const TRIGGER_TEXT =
  "Whenever you cast an instant or sorcery spell, put a number of ember counters on this creature equal to the " +
  "amount of mana spent to cast that spell. Then if this creature has seven or more ember counters on it, remove " +
  "them and transform this creature.";

export default defineCard({
  name: "Smoldering Egg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon", "Egg"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "ember", amount: { manaSpentOf: "trigger-object" } },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "ember", compare: { op: "gte", n: 7 } },
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "remove-counter",
                  target: "source",
                  counter: "ember",
                  amount: { countersOn: "source", counter: "ember" },
                },
                { kind: "transform", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  faces: ["Smoldering Egg", "Ashmouth Dragon"],
  transform: true,
});
