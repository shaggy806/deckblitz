import { defineCard } from "../define.js";

// EDHREC rank 18459.

export default defineCard({
  name: "Storm Skreelix",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Drake", "Horror"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nInstant and sorcery spells you cast cost {1} less to cast.\nWhenever you cast an instant or sorcery spell, this creature gets +2/+0 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, caster: "you", reduceGeneric: 1 },
      text: "Instant and sorcery spells you cast cost {1} less to cast.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, this creature gets +2/+0 until end of turn.",
    },
  ],
});
