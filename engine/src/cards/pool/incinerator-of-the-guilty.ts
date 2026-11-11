import { defineCard } from "../define.js";

// EDHREC rank 7669.
// "You may collect evidence X": the may, then X chosen as the ability resolves — any number up to
// the graveyard's total mana value, since a player who can't exile that much can't choose to
// (rule 701.59b) — then the cards. Collecting evidence 0 by exiling nothing is still collecting
// (its ruling), so the reflexive ability triggers then too, for 0. The damage is X, not the mana
// value exiled, and it's dealt to what the damaged player controls as the reflexive ability resolves.

export default defineCard({
  name: "Incinerator of the Guilty",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nWhenever this creature deals combat damage to a player, you may collect evidence X. When you do, this creature deals X damage to each creature and planeswalker that player controls. (To collect evidence X, exile cards with total mana value X or greater from your graveyard.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Collect evidence X?",
        effect: {
          kind: "choose-value",
          value: "number",
          min: 0,
          max: { aggregate: "sum", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
          prompt: "Collect evidence X: choose X",
          then: {
            kind: "sequence",
            effects: [
              { kind: "collect-evidence", amount: "x", required: true },
              {
                kind: "reflexive-trigger",
                targets: [],
                effect: {
                  kind: "damage-all",
                  filter: { typesAnyOf: ["creature", "planeswalker"] },
                  amount: "x",
                  whose: "trigger-player",
                },
                text: "When you do, this creature deals X damage to each creature and planeswalker that player controls.",
              },
            ],
          },
        },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may collect evidence X. When you do, this creature deals X damage to each creature and planeswalker that player controls.",
    },
  ],
});
