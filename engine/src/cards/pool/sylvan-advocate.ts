import { defineCard } from "../define.js";

const TEXT = "As long as you control six or more lands, this creature and land creatures you control get +2/+2.";

const SIX_LANDS = { kind: "controls", filter: { type: "land" }, atLeast: 6, countsSelf: true } as const;

export default defineCard({
  name: "Sylvan Advocate",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Ally"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [
    { affects: { scope: "self" }, condition: SIX_LANDS, grantPt: [2, 2], text: TEXT },
    // "This creature and land creatures": a land-creature Advocate gets the
    // bonus once, so the second half leaves it out.
    {
      affects: { scope: "filter", filter: { types: ["land", "creature"], controlledBy: "you" }, excludeSelf: true },
      condition: SIX_LANDS,
      grantPt: [2, 2],
      text: TEXT,
    },
  ],
});
