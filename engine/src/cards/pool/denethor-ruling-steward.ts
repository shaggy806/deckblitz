import { defineCard } from "../define.js";

// EDHREC rank 7257.
// Makes Human Soldier → use "Human Soldier Token".
//
// Rulings:
//   [2023-06-16] Denethor, Ruling Steward doesn't need to have been on the battlefield when the
//     creature died. For example, if a creature dies during combat on your turn and you cast
//     Denethor, Ruling Steward during your second main phase, its first ability will trigger at
//     the beginning of your end step.
//   [2023-06-16] Denethor, Ruling Steward's first ability will trigger only once during your end
//     step, no matter how many creatures died under your control this turn. However, if no
//     creatures have died under your control this turn as your end step begins, the ability won't
//     trigger at all. It's not possible to cause a creature to die under your control during the
//     end step in time to have the ability trigger.

export default defineCard({
  name: "Denethor, Ruling Steward",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 4,
  text: "At the beginning of your end step, if a creature died under your control this turn, create a 1/1 white Human Soldier creature token.\n{2}, Sacrifice another creature: Each opponent loses 1 life and you gain 1 life.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, Sacrifice another creature: Each opponent loses 1 life and you gain 1 life.",
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: { kind: "turn-history", what: "died", who: "you", filter: { type: "creature" } },
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if a creature died under your control this turn, create a 1/1 white Human Soldier creature token.",
    },
  ],
});
