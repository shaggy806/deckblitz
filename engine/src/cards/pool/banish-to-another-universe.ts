import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 14877.
//
// Rulings:
//   [2023-10-13] If Banish to another Universe leaves the battlefield before its triggered ability
//     resolves, the target permanent will not be exiled.
//
// Historic is artifacts, legendaries and Sagas (rule 700.6), each permanent
// counted once however many of the three it is. The exile is Banishing
// Light's two linked halves (rule 610.3); `untilSourceLeaves` exiles nothing
// once this has left (the ruling).
const AFFINITY_TEXT =
  "Affinity for historic permanents (This spell costs {1} less to cast for each artifact, legendary, and/or Saga permanent you control.)";
const EXILE_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Banish to Another Universe",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${AFFINITY_TEXT}\n${EXILE_TEXT}`,
  selfCostReduction: affinity({ anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] }),
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
