import { defineCard } from "../define.js";

// EDHREC rank 7112.
//
// Rulings:
//   [2024-06-07] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2024-06-07] Some spells and abilities that give you {E} may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't get any {E}.
//   [2024-06-07] If Static Prison leaves the battlefield before its first triggered ability
//     resolves, the target permanent won't be exiled.
//   [2024-06-07] Auras attached to the exiled permanent will be put into their owners' graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled permanent will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//
// Banishing Light's exile and linked return (rule 610.3's exile "until" and its return), the
// energy in the same targeted ability (so an illegal target gets no {E}
// either). "Sacrifice this unless you pay {E}" is
// Satya's `may` with `costEnergy`: declining, or having no energy, sacrifices.
const ENTER_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield. You get {E}{E} (two energy counters).";
const MAIN_TEXT = "At the beginning of your first main phase, sacrifice this enchantment unless you pay {E}.";

export default defineCard({
  name: "Static Prison",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${MAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "get-energy", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E} to keep Static Prison? (Otherwise it's sacrificed.)",
        costEnergy: 1,
        effect: { kind: "sequence", effects: [] },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
