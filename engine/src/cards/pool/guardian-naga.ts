import { defineCard } from "../define.js";

const PREVENT_TEXT = "During your turn, prevent all damage that would be dealt to this creature.";

export default defineCard({
  name: "Guardian Naga",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 5,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: PREVENT_TEXT,
    },
  ],
  faces: ["Guardian Naga", "Banishing Coils"],
  adventure: true,
});
