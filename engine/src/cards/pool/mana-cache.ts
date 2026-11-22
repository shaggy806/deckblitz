import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 19707.

const COUNTER_TEXT =
  "At the beginning of each player's end step, put a charge counter on this enchantment for each untapped land that player controls.";
const MANA_TEXT =
  "Remove a charge counter from this enchantment: Add {C}. Any player may activate this ability but only during their turn before the end step.";

export default defineCard({
  name: "Mana Cache",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${COUNTER_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "charge",
        amount: { countOf: { type: "land", tapped: false, controlledBy: "active-player" } },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  activated: [
    {
      // A mana ability (rule 605.1a) any player may activate (602.2): the
      // mana goes to whoever activates it, and "their turn" is theirs — the
      // condition is read with the activator as "you".
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      anyPlayer: true,
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          {
            kind: "turn-structure",
            steps: [
              "untap",
              "upkeep",
              "draw",
              "precombat-main",
              "begin-combat",
              "declare-attackers",
              "declare-blockers",
              "combat-damage",
              "end-combat",
              "postcombat-main",
            ],
          },
        ],
      },
      text: MANA_TEXT,
    },
  ],
});
