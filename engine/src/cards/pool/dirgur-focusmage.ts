import { defineCard } from "../define.js";

// EDHREC rank 8292. A preparation card (rule 722): its prepare spell is
// Braingeyser, the pool's own card. The trigger reads the spell's mana value
// from its mana cost alone (the ruling), and resolves before that spell.
const REDUCE_TEXT = "Instant and sorcery spells you cast cost {1} less to cast.";
const PREPARE_TEXT =
  "Whenever you cast an instant or sorcery spell with mana value 5 or greater from your hand, this creature becomes prepared.";

export default defineCard({
  name: "Dirgur Focusmage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 1,
  toughness: 4,
  prepareSpell: "Braingeyser",
  text: `${REDUCE_TEXT}\n${PREPARE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, caster: "you", reduceGeneric: 1 },
      text: REDUCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        from: "hand",
        filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "gte", n: 5 } },
      },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
});
