import { defineCard } from "../define.js";

// EDHREC rank 21270.
// Kicked, the spell also sets up a delayed triggered ability for the rest of
// the turn (rule 603.7c): each creature you control that dies draws a card.
// The +2/+0 reaches only the creatures you control as it resolves.
const KICKER_TEXT = "Kicker {B} (You may pay an additional {B} as you cast this spell.)";
const PUMP_TEXT = "Creatures you control get +2/+0 until end of turn.";
const DIES_TEXT = "Whenever a creature you control dies this turn, draw a card.";
const PUMP = {
  kind: "modify-pt-all",
  filter: { type: "creature", controlledBy: "you" },
  power: 2,
  toughness: 0,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Warhost's Frenzy",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${KICKER_TEXT}\n${PUMP_TEXT} If this spell was kicked, whenever a creature you control dies this turn, draw a card.`,
  kicker: {
    cost: "{B}",
    effect: {
      kind: "sequence",
      effects: [
        PUMP,
        {
          kind: "delayed-trigger",
          at: { whenever: { on: "dies", who: "you-control", filter: { type: "creature" } } },
          effect: { kind: "draw", amount: 1 },
          text: DIES_TEXT,
        },
      ],
    },
  },
  targets: [],
  effect: PUMP,
});
