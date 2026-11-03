import { defineCard } from "../define.js";

const COST = "Tap two untapped artifacts, creatures, and/or lands you control";

export default defineCard({
  name: "Warlord's Elite",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: "As an additional cost to cast this spell, tap two untapped artifacts, creatures, and/or lands you control.",
  additionalCost: {
    also: { text: COST, tapUntapped: { filter: { typesAnyOf: ["artifact", "creature", "land"] }, count: 2 } },
  },
});
