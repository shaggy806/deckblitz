import { defineCard } from "../define.js";

// EDHREC rank 30161.
// Chapter I's "at the beginning of the next combat this turn" is a delayed
// "when" (`once`) that lapses with the turn; "that creature" is the
// chapter's target, read by slot.

const ONE_TEXT =
  "I — This Saga deals 4 damage to target creature an opponent controls. At the beginning of the next combat this turn, gain control of that creature until end of turn. Untap it. It gains haste until end of turn.";
const TWO_TEXT = "II — You may exile a card from your hand. If you do, draw a card.";
const THREE_TEXT = "III — Each opponent sacrifices a nontoken permanent of their choice.";

export default defineCard({
  name: "The Wrath of Khan",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE_TEXT}\n${TWO_TEXT}\n${THREE_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 4, target: 0 },
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "step-begins", step: "begin-combat", who: "any" }, once: true },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-control", target: 0, untilEndOfTurn: true },
                { kind: "untap", target: 0 },
                { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
              ],
            },
            text: "At the beginning of the next combat this turn, gain control of that creature until end of turn. Untap it. It gains haste until end of turn.",
          },
        ],
      },
      resolve: null,
      text: ONE_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "hand", min: 0, max: 1, destination: "exile", leftover: "stay" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", atLeast: 1 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TWO_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { token: false }, count: 1 },
      resolve: null,
      text: THREE_TEXT,
    },
  ],
});
