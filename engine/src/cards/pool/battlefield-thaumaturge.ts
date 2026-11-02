import { defineCard } from "../define.js";

const STATIC = "Each instant and sorcery spell you cast costs {1} less to cast for each creature it targets.";
const HEROIC = "Heroic — Whenever you cast a spell that targets this creature, this creature gains hexproof until end of turn.";

export default defineCard({
  name: "Battlefield Thaumaturge",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: `${STATIC}\n${HEROIC}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["instant", "sorcery"] },
        caster: "you",
        perTarget: true,
        targeting: { type: "creature" },
        reduceGeneric: 1,
      },
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: HEROIC,
    },
  ],
});
