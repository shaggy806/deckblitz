import { defineCard } from "../define.js";

// EDHREC rank 4992. Bilbo's `notFromCastersHand` reduction: generic mana only
// (the ruling), for any spell its controller casts from anywhere but their
// hand — a foretold card from exile included.
//
// Rulings:
//   The cost reduction applies only to generic mana in the costs of spells you cast from anywhere
//     other than your hand. It can't reduce requirements of a specific color of mana.

const REDUCE_TEXT = "Spells you cast from anywhere other than your hand cost {2} less to cast.";

export default defineCard({
  name: "Sage of the Beyond",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Giant"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  foretell: { cost: "{4}{U}" },
  text: `Flying\n${REDUCE_TEXT}\nForetell {4}{U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 2, when: { caster: "you", notFromCastersHand: true } },
      text: REDUCE_TEXT,
    },
  ],
});
