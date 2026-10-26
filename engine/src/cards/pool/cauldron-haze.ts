import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// EDHREC rank 10494. Cauldron of Souls' effect as a spell.
//
// Rulings:
//   [2008-08-01] If a nontoken creature that gains persist this way is put into a graveyard, that
//     card will be returned to the battlefield with a -1/-1 counter on it. However, because it's a
//     new object with no relation to its previous existence, that permanent will not have persist.
//   [2008-08-01] If a creature has multiple instances of persist, the redundant instances will
//     have no effect.

const TEXT =
  "Choose any number of target creatures. Each of those creatures gains persist until end of turn. (When it dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";

export default defineCard({
  name: "Cauldron Haze",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "any-number", of: "creature" }],
  // Each target gains the persist trigger itself, so the creature that
  // returns is a new object without it (the first ruling).
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "grant-triggered", target: 0, ability: persist(), duration: "end-of-turn" },
  },
});
