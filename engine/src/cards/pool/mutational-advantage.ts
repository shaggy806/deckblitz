import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// "Permanents you control with counters on them" are the ones with counters
// as the spell resolves (the ruling, rule 611.2c): the grants lock in their
// set, and the prevention is a shield on each of those same permanents
// (`for-each-permanent` → `prevent-damage` "all"), not a rule asked of
// whatever has counters when damage would be dealt. A permanent that gets a
// counter later this turn — the proliferate right after included — isn't
// protected; one that loses its counters stays protected.
const withCounters: CardFilter = { controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } };

export default defineCard({
  name: "Mutational Advantage",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text:
    "Permanents you control with counters on them gain hexproof and indestructible until end of turn. Prevent all damage that would be dealt to those permanents this turn. Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: withCounters, keyword: "hexproof", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: withCounters, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      {
        kind: "for-each-permanent",
        filter: withCounters,
        simultaneous: true,
        effect: { kind: "prevent-damage", target: 0, amount: "all" },
      },
      { kind: "proliferate" },
    ],
  },
});
