import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghalta the Immovable",
  manaCost: "{8}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dinosaur"],
  power: 0,
  toughness: 7,
  text: "This spell costs {X} less to cast, where X is the greatest toughness among creatures you control.\nCreatures you control can attack as though they didn't have defender.\nEach creature you control with toughness greater than its power assigns combat damage equal to its toughness rather than its power.",
  selfCostReduction: {
    // Unconditional: the always-true gate The Great Henge uses. Only the
    // generic part comes off, so {W} is always paid (the ruling).
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { aggregate: "max", of: "toughness", filter: { type: "creature", controlledBy: "you" } },
  },
  static: [
    {
      affects: { scope: "creatures-you-control" },
      canAttackAsThoughNoDefender: true,
      text: "Creatures you control can attack as though they didn't have defender.",
    },
    {
      affects: { scope: "creatures-you-control" },
      combatDamageByToughness: "if-toughness-greater",
      text: "Each creature you control with toughness greater than its power assigns combat damage equal to its toughness rather than its power.",
    },
  ],
});
