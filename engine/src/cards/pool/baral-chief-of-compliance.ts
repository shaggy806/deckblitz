import { defineCard } from "../define.js";

// EDHREC rank 1342.
//
// Rulings:
//   The cost reduction applies only to generic mana in the cost of instant and sorcery spells you cast.
//   A spell or ability counters a spell only if it specifically contains the word "counter" in its
//     text. If a spell or ability you control causes all the targets of a spell to become illegal,
//     that spell doesn't resolve but it's not countered.
const REDUCTION = "Instant and sorcery spells you cast cost {1} less to cast.";
const LOOT = "Whenever a spell or ability you control counters a spell, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Baral, Chief of Compliance",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${REDUCTION}\n${LOOT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, reduceGeneric: 1, when: { caster: "you" } },
      text: REDUCTION,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: LOOT,
    },
  ],
});
