import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] You choose {R} or {G} for each Raccoon you control. You aren't limited to only one
//     color of mana.
//   [2024-07-26] Muerra's first ability is not a mana ability. It uses the stack and can be
//     responded to.
//   [2024-07-26] You pay all costs and follow all timing rules for cards played this way.
//   [2024-07-26] You may play the exiled cards even if Muerra is no longer on the battlefield or
//     under your control.

const MAIN_TEXT = "At the beginning of your first main phase, add {R} or {G} for each Raccoon you control.";
const EXPEND4_TEXT = "Whenever you expend 4, you gain 3 life.";
const EXPEND8_TEXT =
  "Whenever you expend 8, exile the top two cards of your library. Until the end of your next turn, you may play those cards.";

export default defineCard({
  name: "Muerra, Trash Tactician",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Raccoon", "Warrior"],
  power: 2,
  toughness: 4,
  text: `${MAIN_TEXT}\n${EXPEND4_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)\n${EXPEND8_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      // Counted as it resolves; any combination of {R} and {G} (the ruling).
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["R", "G"] },
        amount: { countOf: { subtype: "Raccoon", controlledBy: "you" } },
      },
      resolve: null,
      text: MAIN_TEXT,
    },
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: EXPEND4_TEXT,
    },
    {
      trigger: { on: "expend", who: "you", amount: 8 },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
      resolve: null,
      text: EXPEND8_TEXT,
    },
  ],
});
