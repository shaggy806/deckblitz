import { defineCard } from "../define.js";

const TEXT =
  "Undergrowth — This creature enters with a +1/+1 counter on it for each creature card in your graveyard.";

export default defineCard({
  name: "Golgari Raiders",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 0,
  toughness: 0,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
      },
      text: TEXT,
    },
  ],
});
