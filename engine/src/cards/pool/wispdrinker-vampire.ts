import { defineCard } from "../define.js";

// Rulings: the trigger reads the creature's power as it enters (its counters
// included) and doesn't care if it grows after; the activated ability reaches
// only the creatures you control as it resolves.

const DRAIN =
  "Whenever another creature you control with power 2 or less enters, each opponent loses 1 life and you gain 1 life.";
const GRANT = "{5}{W}{B}: Creatures you control with power 2 or less gain deathtouch and lifelink until end of turn.";
const SMALL = { type: "creature", controlledBy: "you", power: { op: "lte", n: 2 } } as const;

export default defineCard({
  name: "Wispdrinker Vampire",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DRAIN}\n${GRANT}`,
  activated: [
    {
      cost: { mana: "{5}{W}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: SMALL, keyword: "deathtouch", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: SMALL, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GRANT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
  ],
});
