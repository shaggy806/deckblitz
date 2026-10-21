import { defineCard } from "../define.js";

// EDHREC rank 10877.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, this creature deals 1 damage to each player. Then if you have 10 or less life, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Spawn of Mayhem",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  alternativeCost: {
    mana: "{1}{B}{B}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: `Spectacle {1}{B}{B} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nFlying, trample\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-player" },
          {
            kind: "conditional",
            condition: { kind: "life-total", who: "you", atMost: 10 },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
