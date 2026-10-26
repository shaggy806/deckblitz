import { defineCard } from "../define.js";

export default defineCard({
  name: "Stinkdrinker Daredevil",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 3,
  text: "Giant spells you cast cost {2} less to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Giant" }, caster: "you", reduceGeneric: 2 },
      text: "Giant spells you cast cost {2} less to cast.",
    },
  ],
});
