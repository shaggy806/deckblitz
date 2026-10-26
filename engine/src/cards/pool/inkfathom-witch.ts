import { defineCard } from "../define.js";

// Rulings: creatures don't lose their abilities; only creatures unblocked as it resolves are
// affected (none before blockers are declared), and they stay 4/1 until end of turn.

export default defineCard({
  name: "Inkfathom Witch",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n{2}{U}{B}: Each unblocked creature has base power and toughness 4/1 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{U}{B}", tap: false },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "creature", unblocked: true },
        power: 4,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{U}{B}: Each unblocked creature has base power and toughness 4/1 until end of turn.",
    },
  ],
});
