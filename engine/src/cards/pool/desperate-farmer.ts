import { defineCard } from "../define.js";

const DIES_TEXT = "When another creature you control dies, transform this creature.";

export default defineCard({
  name: "Desperate Farmer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Desperate Farmer", "Depraved Harvester"],
  transform: true,
});
