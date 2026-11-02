import { defineCard } from "../define.js";

const TEXT = "Spells that target this creature cost {2} less to cast.";

export default defineCard({
  name: "Spellwild Ouphe",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, targetingSource: true, reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
