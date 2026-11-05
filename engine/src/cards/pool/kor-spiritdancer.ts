import { defineCard } from "../define.js";

// EDHREC rank 1983.

export default defineCard({
  name: "Kor Spiritdancer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Wizard"],
  power: 0,
  toughness: 2,
  text: "This creature gets +2/+2 for each Aura attached to it.\nWhenever you cast an Aura spell, you may draw a card.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Aura" } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever you cast an Aura spell, you may draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura", attachedTo: { isSource: true } }, pt: [2, 2] },
      text: "This creature gets +2/+2 for each Aura attached to it.",
    },
  ],
});
