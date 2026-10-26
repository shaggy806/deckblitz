import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 14765.
//
// Venture Forth's shape: the resolving spell exiles itself suspended
// (`give-suspend` on `"source"`). A spell whose only target is illegal
// doesn't resolve at all (rule 608.2b), so it isn't exiled then — the ruling.
//
// Rulings:
//   [2021-03-19] Each time you cast Arc Blade, it will suspend itself again when it resolves so
//     you can cast it again three turns later.
//   [2021-03-19] If the chosen target is an illegal target by the time Arc Blade tries to resolve,
//     the spell doesn't resolve. You don't exile it with time counters on it.

export default defineCard({
  name: "Arc Blade",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{R}" },
  text: "Arc Blade deals 2 damage to any target. Exile Arc Blade with three time counters on it.\nSuspend 3—{2}{R} (Rather than cast this card from your hand, you may pay {2}{R} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
