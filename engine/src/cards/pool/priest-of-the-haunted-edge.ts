import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 14878. X is counted as the ability resolves
// (the ruling).
const TEXT =
  "{T}, Sacrifice this creature: Target creature gets -X/-X until end of turn, where X is the number of snow lands you control. Activate only as a sorcery.";
const MINUS_X = { product: [{ countOf: { type: "land", supertype: "snow", controlledBy: "you" } }, -1] } as const;

export default defineCard({
  name: "Priest of the Haunted Edge",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 0,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
