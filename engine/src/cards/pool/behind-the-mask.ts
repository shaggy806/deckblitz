import { defineCard } from "../define.js";

// "Becomes an artifact creature" keeps its other types (rule 205.1b). The
// base P/T is layer 7b: counters and other modifications still apply on top
// (the rulings). "If evidence was collected" (rule 701.59c) is the spell
// being kicked — still an artifact creature, base 1/1 instead.
export default defineCard({
  name: "Behind the Mask",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may collect evidence 6. (Exile cards with total mana value 6 or greater from your graveyard.)\nUntil end of turn, target artifact or creature becomes an artifact creature with base power and toughness 4/3. If evidence was collected, it has base power and toughness 1/1 until end of turn instead.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 3,
    addTypes: ["artifact", "creature"],
    addSubtypes: [],
    duration: "end-of-turn",
  },
  kicker: {
    cost: "",
    keyword: "collect-evidence",
    collectEvidence: 6,
    effect: {
      kind: "animate",
      target: 0,
      power: 1,
      toughness: 1,
      addTypes: ["artifact", "creature"],
      addSubtypes: [],
      duration: "end-of-turn",
    },
  },
});
