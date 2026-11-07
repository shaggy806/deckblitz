import { defineCard } from "../define.js";

// EDHREC rank 2599. Flagged "Build ASAP" (B273). Branching Evolution's
// multiplier over any kind of counter, on a creature, Spacecraft or Planet you
// control. Counters put as a cost are reached too (only Doubling Season's "an
// effect" wording leaves them out), as are counters a permanent enters with.

const DOUBLE_TEXT =
  "If one or more counters would be put on a creature, Spacecraft, or Planet you control, twice that many of each of those kinds of counters are put on it instead.";

export default defineCard({
  name: "Loading Zone",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${DOUBLE_TEXT}\nWarp {G} (You may cast this card from your hand for its warp cost. Exile this enchantment at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{G}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        multiplier: 2,
        filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }, { subtype: "Planet" }] },
      },
      text: DOUBLE_TEXT,
    },
  ],
});
