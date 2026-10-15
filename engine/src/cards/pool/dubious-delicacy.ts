import { defineCard } from "../define.js";

// EDHREC rank 16456.
//
// Rulings:
//   [2025-07-25] If an effect refers to a Food, it means any Food artifact, not just a Food token.
//   [2025-07-25] You can't sacrifice a Food to pay multiple costs.

const ENTER_TEXT = "When this artifact enters, up to one target creature gets -3/-3 until end of turn.";
const GAIN_TEXT = "{2}, {T}, Sacrifice this artifact: You gain 3 life.";
const DRAIN_TEXT = "{2}, {T}, Sacrifice this artifact: Target opponent loses 3 life.";

export default defineCard({
  name: "Dubious Delicacy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Food"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${GAIN_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: GAIN_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: 3, target: 0 },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
