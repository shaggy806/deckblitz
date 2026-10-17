import { defineCard } from "../define.js";

// `firstEachTurn` with a `filter` is the caster's first *matching* spell this turn — the first
// instant or sorcery, whatever else was cast before it.
const TEXT =
  "Whenever you cast your first instant or sorcery spell each turn, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Aquatic Alchemist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Aquatic Alchemist", "Bubble Up"],
  adventure: true,
});
