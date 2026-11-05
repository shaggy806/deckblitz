import { defineCard } from "../define.js";

// EDHREC rank 4210.

export default defineCard({
  name: "Sorin Markov",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sorin"],
  loyalty: 4,
  text: "+2: Sorin Markov deals 2 damage to any target and you gain 2 life.\n−3: Target opponent's life total becomes 10.\n−7: You control target player during that player's next turn.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "+2: Sorin Markov deals 2 damage to any target and you gain 2 life.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: { kind: "set-life-total", who: 0, amount: 10 },
      resolve: null,
      text: "−3: Target opponent's life total becomes 10.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "control-player", target: 0 },
      resolve: null,
      text: "−7: You control target player during that player's next turn.",
    },
  ],
});
