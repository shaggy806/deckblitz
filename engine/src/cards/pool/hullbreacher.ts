import { defineCard } from "../define.js";

const TEXT = "If an opponent would draw a card except the first one they draw in each of their draw steps, instead you create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";

export default defineCard({
  name: "Hullbreacher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Pirate"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "opponent",
        exceptFirstInDrawStep: true,
        instead: { effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
      },
      text: TEXT,
    },
  ],
});
