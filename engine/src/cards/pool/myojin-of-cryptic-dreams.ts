import { defineCard } from "../define.js";

// EDHREC rank 7778.
//
// Rulings:
//   [2022-02-18] If you copy a permanent spell that has targets, such as an Aura spell, those
//     targets remain unchanged.
//
// The enters-with-counter is Patched Plaything's cast-from-hand replacement;
// the copy is Lithoform Engine's, three times over. Copies of a permanent spell
// keep its targets (no `newTargets`), as the ruling says.
const ENTER_TEXT =
  "Myojin of Cryptic Dreams enters with an indestructible counter on it if you cast it from your hand.";
const COPY_TEXT =
  "Remove an indestructible counter from Myojin of Cryptic Dreams: Copy target permanent spell you control three times. (The copies become tokens.)";

export default defineCard({
  name: "Myojin of Cryptic Dreams",
  manaCost: "{5}{U}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "indestructible",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "indestructible", count: 1 } },
      targets: [{ kind: "spell", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "copy-spell", target: 0 },
          { kind: "copy-spell", target: 0 },
          { kind: "copy-spell", target: 0 },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
