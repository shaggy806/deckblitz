import { defineCard } from "../define.js";

export default defineCard({
  name: "Underworld Charger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horse"],
  power: 3,
  toughness: 3,
  text: "This creature can't block.\nEscape—{4}{B}, Exile three other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\nThis creature escapes with two +1/+1 counters on it.",
  escape: { cost: "{4}{B}", exileCount: 3, counters: { kind: "+1/+1", amount: 2 } },
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
