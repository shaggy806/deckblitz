import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 21822. "A creature named
// Eight-and-a-Half-Tails is on the battlefield" is anyone's: you or some
// opponent controlling one, checked as the trigger resolves, after the
// counter goes on.

const TRIGGER_TEXT =
  "At the beginning of your upkeep, put a devotion counter on this creature. Then if a creature named Eight-and-a-Half-Tails is on the battlefield, you gain 1 life for each devotion counter on this creature.";
const TAILS = { type: "creature", name: "Eight-and-a-Half-Tails" } as const;

export default defineCard({
  name: "Pious Kitsune",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 1,
  toughness: 2,
  text: `${TRIGGER_TEXT}\n{T}, Remove a devotion counter from this creature: You gain 1 life.`,
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "devotion", count: 1 } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{T}, Remove a devotion counter from this creature: You gain 1 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "devotion", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "any",
              of: [
                { kind: "controls", filter: TAILS, atLeast: 1 },
                { kind: "opponent-controls", filter: TAILS, atLeast: 1 },
              ],
            },
            then: { kind: "gain-life", amount: { countersOn: "source", counter: "devotion" } },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
