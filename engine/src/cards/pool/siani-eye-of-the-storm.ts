import { defineCard } from "../define.js";

// EDHREC rank 15040. Commander Legends (CMR).
//
// X is counted as the ability resolves (the ruling), Siani included if it's
// still attacking with flying.
//
// Rulings:
//   [2020-11-10] Use the number of attacking creatures with flying as the ability resolves to
//     determine the value of X.

const ATTACK_TEXT = "Whenever Siani attacks, scry X, where X is the number of attacking creatures with flying.";

export default defineCard({
  name: "Siani, Eye of the Storm",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  pairing: { kind: "partner" },
  text: `Flying\n${ATTACK_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "scry",
        amount: { countOf: { type: "creature", attacking: true, keyword: "flying" } },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
