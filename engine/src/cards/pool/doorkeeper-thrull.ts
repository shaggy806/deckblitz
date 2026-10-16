import { defineCard } from "../define.js";

const TEXT = "Artifacts and creatures entering don't cause abilities to trigger.";

export default defineCard({
  name: "Doorkeeper Thrull",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  static: [
    {
      // Karn, Argent Defender's ability: every controller's triggers, the
      // entering permanent judged as it entered (an artifact land too).
      affects: { scope: "self" },
      suppressEntryTriggers: { who: "everyone", entering: { typesAnyOf: ["artifact", "creature"] } },
      text: TEXT,
    },
  ],
});
