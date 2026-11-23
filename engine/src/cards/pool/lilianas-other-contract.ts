import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2), front face. The replacement is asked
// for every way of losing but conceding (rule 104.3a); the Contract comes
// back as Liliana's Undead Minion, a new object, and her "You can't lose the
// game" then stops the next check from losing it again.

const LOSE_TEXT =
  "If you would lose the game, instead exile Liliana's Other Contract, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Liliana's Other Contract",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `When Liliana's Other Contract enters the battlefield, you draw three cards and you lose 3 life.\n${LOSE_TEXT}`,
  faces: ["Liliana's Other Contract", "Liliana's Undead Minion"],
  transform: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "lose-life", amount: 3 },
        ],
      },
      resolve: null,
      text: "When Liliana's Other Contract enters the battlefield, you draw three cards and you lose 3 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-lose-game",
        who: "you",
        instead: { effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true } },
      },
      text: LOSE_TEXT,
    },
  ],
});
