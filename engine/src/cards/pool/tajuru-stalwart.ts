import { defineCard } from "../define.js";

const TEXT = "Converge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.";

export default defineCard({
  name: "Tajuru Stalwart",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout", "Ally"],
  power: 0,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } } },
      text: TEXT,
    },
  ],
});
