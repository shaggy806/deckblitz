import { defineCard } from "../define.js";

// Champions of Kamigawa. "Another player" is every player but you — each an
// opponent in a game without teams — so the trigger is `to: "opponent"`, once
// per player dealt damage, for the amount that player was dealt. X is the
// number of theft counters removed (Cruel Sadist's cost shape).

export default defineCard({
  name: "Night Dealings",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever a source you control deals damage to another player, put that many theft counters on this enchantment.\n{2}{B}{B}, Remove X theft counters from this enchantment: Search your library for a nonland card with mana value X, reveal it, put it into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "theft", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever a source you control deals damage to another player, put that many theft counters on this enchantment.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: false, removeCounter: { kind: "theft", count: "x" } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { notTypes: ["land"], manaValue: { op: "eq", n: "x" } },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "{2}{B}{B}, Remove X theft counters from this enchantment: Search your library for a nonland card with mana value X, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
