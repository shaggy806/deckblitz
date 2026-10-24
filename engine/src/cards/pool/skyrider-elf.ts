import { defineCard } from "../define.js";

// EDHREC rank 24957.
//
// X only lets more mana, and so more colours, be spent; the counters count
// the colours (the rulings) — Crystalline Crawler's converge replacement.
const CONVERGE_TEXT =
  "Converge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.";

export default defineCard({
  name: "Skyrider Elf",
  manaCost: "{X}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior", "Ally"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${CONVERGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } } },
      text: CONVERGE_TEXT,
    },
  ],
});
