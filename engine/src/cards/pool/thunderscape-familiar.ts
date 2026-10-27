import { defineCard } from "../define.js";

// One static over "black or green": a black-green spell costs {1} less, not
// {2} (the ruling) — Nightscape Familiar's shape.
const TEXT = "Black spells and green spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Thunderscape Familiar",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { anyOf: [{ colors: ["B"] }, { colors: ["G"] }] },
        caster: "you",
        reduceGeneric: 1,
      },
      text: TEXT,
    },
  ],
});
