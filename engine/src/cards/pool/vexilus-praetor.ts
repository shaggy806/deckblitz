import { defineCard } from "../define.js";

// Protection from everything is a protection with an empty filter (rule 702.16j).
// Its other effects still reach them: a sweeper that doesn't target or damage
// (the ruling).

const TEXT = "Aegis of the Emperor — Commanders you control have protection from everything.";

export default defineCard({
  name: "Vexilus Praetor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Custodes", "Warrior"],
  power: 3,
  toughness: 4,
  keywords: ["flash", "vigilance"],
  text: `Flash\nVigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { isCommander: true, controlledBy: "you" } },
      protection: { filter: {} },
      text: TEXT,
    },
  ],
});
