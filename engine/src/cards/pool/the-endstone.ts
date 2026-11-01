import { defineCard } from "../define.js";

export default defineCard({
  name: "The Endstone",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text:
    "Whenever you play a land or cast a spell, draw a card.\n" +
    "At the beginning of your end step, your life total becomes half your starting life total, rounded up.",
  triggered: [
    {
      trigger: { on: "plays-land", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you play a land or cast a spell, draw a card.",
    },
    {
      // `otherOnly`: the spell being cast is in the trigger scan, and The
      // Endstone isn't on the battlefield as it's cast.
      trigger: { on: "cast-spell", who: "you", otherOnly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you play a land or cast a spell, draw a card.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "set-life-total", who: "you", amount: { half: { startingLifeTotal: true }, round: "up" } },
      resolve: null,
      text: "At the beginning of your end step, your life total becomes half your starting life total, rounded up.",
    },
  ],
});
