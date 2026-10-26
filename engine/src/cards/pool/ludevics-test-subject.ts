import { defineCard } from "../define.js";

const HATCH_TEXT =
  "{1}{U}: Put a hatchling counter on this creature. Then if there are five or more hatchling counters on it, remove all of them and transform it.";

// The five-counter check is the ability's own, as it resolves (as Primal
// Amulet's): counters put on some other way wait for the next activation.
export default defineCard({
  name: "Ludevic's Test Subject",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Lizard", "Egg"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${HATCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "hatchling", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "hatchling", compare: { op: "gte", n: 5 } },
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "remove-counter",
                  target: "source",
                  counter: "hatchling",
                  amount: { countersOn: "source", counter: "hatchling" },
                },
                { kind: "transform", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: HATCH_TEXT,
    },
  ],
  faces: ["Ludevic's Test Subject", "Ludevic's Abomination"],
  transform: true,
});
