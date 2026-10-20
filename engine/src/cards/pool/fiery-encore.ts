import { defineCard } from "../define.js";

// Narset of the Ancient Way's reflexive trigger: only a nonland card
// discarded fires it, and its target is chosen as it goes on the stack,
// after this copy has finished resolving (the second ruling). With no card
// to discard, the draw still happens and nothing is dealt (the third).
const SPELL_TEXT =
  "Discard a card, then draw a card. When you discard a nonland card this way, Fiery Encore deals damage equal to that card's mana value to target creature or planeswalker.";
const STORM_TEXT = "Storm (When you cast this spell, copy it for each spell cast before it this turn.)";

export default defineCard({
  name: "Fiery Encore",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${SPELL_TEXT}\n${STORM_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
        then: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
          value: { thisWay: "discarded", sumOf: "mana-value" },
          effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
          text: "When you discard a nonland card this way, Fiery Encore deals damage equal to that card's mana value to target creature or planeswalker.",
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
