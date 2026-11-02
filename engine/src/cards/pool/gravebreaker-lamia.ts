import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, search your library for a card, put it into your graveyard, then shuffle.";
const REDUCTION = "Spells you cast from your graveyard cost {1} less to cast.";

export default defineCard({
  name: "Gravebreaker Lamia",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Snake", "Lamia"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${ENTERS}\n${REDUCTION}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "search-library", filter: {}, destination: "graveyard", min: 1, max: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", castFrom: "graveyard", reduceGeneric: 1 },
      text: REDUCTION,
    },
  ],
});
