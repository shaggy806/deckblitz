import { defineCard } from "../define.js";

// EDHREC rank 10769.
//
// Rulings:
//   The mana value of a split card in the graveyard is the total mana value of
//   both halves; a double-faced card's is its front face's; X is 0; a land
//   card's is 0.
//   You may cast the spell immediately. You must pay all costs for a spell
//   cast this way.

const REDUCE_TEXT = "This spell costs {1} less to cast for each different mana value among cards in your graveyard.";
const CAST_TEXT = "Whenever you discard a nonland card, you may cast it from your graveyard.";

// The reduction counts generic mana only, so it never goes below {U}{B}. Cast
// from a graveyard, Oskar is on the stack as its cost is worked out (rules
// 601.2a, 601.2f), so its own mana value isn't among the graveyard's. "It" is
// the discarded card where the discard put it: one madness put in exile, or
// one that has left the graveyard since, can't be cast this way (rule 400.7).
export default defineCard({
  name: "Oskar, Rubbish Reclaimer",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${REDUCE_TEXT}\n${CAST_TEXT}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
  },
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true, filter: { notTypes: ["land"] } },
      targets: [],
      // In your graveyard: a card you own (rule 400.3).
      effect: { kind: "cast-now", target: "trigger-object", spell: { inZone: "graveyard", ownedBy: "you" } },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
