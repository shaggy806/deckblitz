import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Not legendary (the ruling). Printed
// loyalty * (rule 306.5b): the life total is read as it enters, a
// replacement (Dakkon, Shadow Slayer's shape), and after that the two are
// unrelated. "You can't be attacked" is Blazing Archon's restriction:
// creatures can still attack the Decoy itself (the ruling).

const STATIC_TEXT =
  "Personal Decoy enters with a number of loyalty counters on it equal to your life total. If it would leave the battlefield, exile it instead of putting it anywhere else. You can't be attacked.";

export default defineCard({
  name: "Personal Decoy",
  manaCost: "{5}{W}{U}",
  colors: ["W", "U"],
  types: ["planeswalker"],
  subtypes: ["Duck"],
  loyalty: 0,
  text: `${STATIC_TEXT}\n+1: You gain 1 life.\n−4: Draw a card.`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "+1: You gain 1 life.",
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "−4: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "loyalty", amount: { lifeTotal: "you" } },
      },
      text: "Personal Decoy enters with a number of loyalty counters on it equal to your life total.",
    },
    {
      affects: { scope: "self" },
      exileIfLeaves: true,
      text: "If it would leave the battlefield, exile it instead of putting it anywhere else.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      restrictions: [{ kind: "cant-attack", at: "you" }],
      text: "You can't be attacked.",
    },
  ],
});
