import { defineCard } from "../define.js";

// Delirium is checked as the spell resolves, while Unholy Heat is still on the
// stack (its ruling), so it never counts itself.
export default defineCard({
  name: "Unholy Heat",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Unholy Heat deals 2 damage to target creature or planeswalker.\nDelirium — Unholy Heat deals 6 damage instead if there are four or more card types among cards in your graveyard.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "damage",
    target: 0,
    amount: { ifCondition: { kind: "delirium" }, then: 6, else: 2 },
  },
});
