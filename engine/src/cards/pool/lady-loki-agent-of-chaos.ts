import { defineCard } from "../define.js";

// EDHREC rank 16458.
//
// - "Your first instant, sorcery, or Villain spell each turn" is Arcane
//   Bombardment's `firstTimeEachTurn` over the filter.
// - "Exile it, then exile cards from the top of your library until you exile a
//   nonland card" is Possibility Storm's: the spell is exiled from the stack
//   (it never resolves), and every card exiled from the library stays exiled.
// - The damage is the difference between the two mana values, larger minus
//   smaller; then that card may be cast free as the trigger resolves.

const TEXT =
  "Whenever you cast your first instant, sorcery, or Villain spell each turn, exile it, then exile cards from the top of your library until you exile a nonland card. Lady Loki deals damage to each opponent equal to the difference between that spell's mana value and that nonland card's mana value. You may cast that card without paying its mana cost.";

export default defineCard({
  name: "Lady Loki, Agent of Chaos",
  manaCost: "{5}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Sorcerer", "Villain"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        firstTimeEachTurn: true,
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Villain" }] },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "reveal-until",
            filter: { notTypes: ["land"] },
            exile: true,
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "damage",
                  who: "each-opponent",
                  amount: { difference: [{ manaValueOf: "trigger-object" }, { manaValueOf: 0 }], absolute: true },
                },
                { kind: "cast-now", target: 0, free: true },
              ],
            },
            rest: "stay",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
