import { defineCard } from "../define.js";

// EDHREC rank 6822.
//
// A daybound/nightbound werewolf (rule 702.145 — Harvesttide Infiltrator's
// shape): as it becomes night it transforms into `Frenzied Trapbreaker`, and
// back as it becomes day.
const SAC_TEXT = "{1}, Sacrifice this creature: Destroy target artifact or enchantment.";

export default defineCard({
  name: "Outland Liberator",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 2,
  keywords: ["daybound"],
  text: `${SAC_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  faces: ["Outland Liberator", "Frenzied Trapbreaker"],
  transform: true,
});
