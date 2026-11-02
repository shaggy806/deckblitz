import { defineCard } from "../define.js";

const TEXT = "If a triggered ability of another Elemental you control triggers, it triggers an additional time.";

export default defineCard({
  name: "Twinflame Travelers",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      doubleTriggersOf: { filter: { subtype: "Elemental", controlledBy: "you", isSource: false } },
      text: TEXT,
    },
  ],
});
