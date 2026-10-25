import { defineCard } from "../define.js";

const TEXT = "Creatures entering don't cause abilities to trigger.";

export default defineCard({
  name: "Hushwing Gryff",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Hippogriff"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      suppressEntryTriggers: { who: "everyone", entering: { type: "creature" } },
      text: TEXT,
    },
  ],
});
