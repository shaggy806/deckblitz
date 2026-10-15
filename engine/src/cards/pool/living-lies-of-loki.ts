import { defineCard } from "../define.js";

// EDHREC rank 24000.
// "Each other Illusion you control" is any permanent of that type, not only
// creatures.

const PUMP_TEXT = "This creature gets +1/+0 for each other Illusion you control.";

export default defineCard({
  name: "Living Lies of Loki",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Villain"],
  power: 1,
  toughness: 3,
  text: `${PUMP_TEXT}\nWhen this creature dies, draw a card.`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Illusion", controlledBy: "you" }, pt: [1, 0], excludeSelf: true },
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature dies, draw a card.",
    },
  ],
});
