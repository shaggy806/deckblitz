import { defineCard } from "../define.js";

const TEXT = "Spells you cast that target a creature cost {2} less to cast.";

export default defineCard({
  name: "Killian, Ink Duelist",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink", "menace"],
  text: `Lifelink\nMenace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", targeting: { type: "creature" }, reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
