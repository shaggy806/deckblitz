import { defineCard } from "../define.js";

// EDHREC rank 25244. Crystalline Crawler's converge replacement.
const CONVERGE_TEXT =
  "Converge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.";

export default defineCard({
  name: "Woodland Wanderer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${CONVERGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } } },
      text: CONVERGE_TEXT,
    },
  ],
});
