import { defineCard } from "../define.js";

// Mathas, Fiend Seeker's bounty shape: the granted trigger lasts while the
// land has a blaze counter (rule 611.2b), whether or not this creature is
// still around, and burns the land's controller at their own upkeep (its
// rulings). A land that already has one is no legal target.

const BURN_TEXT = "At the beginning of your upkeep, this land deals 1 damage to you.";
const TEXT = `{1}{R}{R}: Put a blaze counter on target land without a blaze counter on it. For as long as that land has a blaze counter on it, it has "${BURN_TEXT}"`;

export default defineCard({
  name: "Obsidian Fireheart",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (The land continues to burn after this creature has left the battlefield.)`,
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "land", counters: { kind: "blaze", compare: { op: "eq", n: 0 } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "blaze", amount: 1 },
          {
            kind: "grant-triggered",
            target: 0,
            duration: { whileCounter: "blaze" },
            ability: {
              trigger: { on: "step-begins", step: "upkeep", who: "you" },
              targets: [],
              effect: { kind: "damage", amount: 1, who: "you" },
              resolve: null,
              text: BURN_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
