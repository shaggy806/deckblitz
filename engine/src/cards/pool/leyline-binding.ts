import { defineCard } from "../define.js";

// Domain reduces only the generic part, and its mana value stays 6 (the
// ruling). The exiled card returns the moment this leaves (rule 610.3 —
// `untilSourceLeaves`).
const DOMAIN_TEXT = "Domain — This spell costs {1} less to cast for each basic land type among lands you control.";
const EXILE_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Leyline Binding",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${DOMAIN_TEXT}\n${EXILE_TEXT}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { basicLandTypes: "you" },
  },
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
