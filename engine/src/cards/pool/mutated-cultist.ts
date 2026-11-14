import { defineCard } from "../define.js";

// EDHREC rank 8968.
//
// Rulings:
//   Counters that players could have include energy counters, experience counters, poison
//   counters, rad counters, and ticket counters.
//   The triggered ability can target a permanent controlled by any player, but it can't target
//   you. It can target a permanent or opponent with no counters. If the targeted permanent or
//   opponent has more than one kind of counter, you must remove all of them.
//
// One slot, a permanent or an opponent: `remove-counter` acts on a permanent
// and `remove-player-counters` on a player, each passing over the other, and
// `thisWay: "counters-removed"` counts a player's counters too (rule 122.1).

const CAST_TEXT =
  "When you cast this spell, remove all counters from up to one target permanent or opponent. The next spell you cast this turn costs {1} less to cast for each counter removed this way.";

export default defineCard({
  name: "Mutated Cultist",
  manaCost: "{2}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Horror"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Devoid (This card has no color.)\n${CAST_TEXT}\nDeathtouch`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: {}, orPlayer: "opponent" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
          { kind: "remove-player-counters", target: 0, counter: "every-kind", amount: "all" },
          { kind: "grant-spells-this-turn", next: true, reduceGeneric: { thisWay: "counters-removed" } },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
