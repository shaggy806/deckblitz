import { defineCard } from "../define.js";

const TEXT = "Black spells you cast cost {B} more to cast.";

export default defineCard({
  name: "Andradite Leech",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 2,
  toughness: 2,
  text: `${TEXT}\n{B}: This creature gets +1/+1 until end of turn.`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["B"] }, caster: "you", increaseColored: "{B}" },
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gets +1/+1 until end of turn.",
    },
  ],
});
