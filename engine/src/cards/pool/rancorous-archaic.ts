import { defineCard } from "../define.js";

// EDHREC rank 22815. Converge is Crystalline Crawler's replacement: the
// colours of mana spent to cast it, kept by the permanent from the stack; 0
// for a free cast, a copy, or one that wasn't cast (the rulings).
const CONVERGE_TEXT =
  "Converge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.";

export default defineCard({
  name: "Rancorous Archaic",
  manaCost: "{5}",
  colors: [],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 2,
  toughness: 2,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${CONVERGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } } },
      text: CONVERGE_TEXT,
    },
  ],
});
