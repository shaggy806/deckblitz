import { defineCard } from "../define.js";
import { ravenous } from "../helpers.js";

// EDHREC rank 6975.
//
// Rulings:
//   [2022-10-07] If a permanent spell with ravenous is copied, the copy will have the same value
//     for X, and the token permanent that the spell becomes as it enters the battlefield will
//     enter with X counters.
//   [2022-10-07] The triggered ability that checks to see if X is 5 or greater refers to the value
//     of X that was chosen as the spell was cast, which may be different from the number of
//     counters it entered with if there are replacement effects involved. This is also true for
//     any other ability that it has which refers to X and triggers when it enters the battlefield.
//   [2022-10-07] If another permanent enters the battlefield as a copy of a creature with
//     Ravenous, it will not enter with any counters from the ravenous ability.
//   [2022-10-07] A creature with ravenous gets its counters as it enters the battlefield. It
//     doesn't enter the battlefield first and then get its counters. Any triggered ability that
//     looks for a creature with a certain power or toughness entering the battlefield will see the
//     counters when it checks to see if it should trigger.
//
// Ravenous is the `ravenous()` helper (Aberrant). Warp Blast's X is the X the
// spell was cast with, not the counters it got (the first rulings) — 0 when
// it entered any other way, as Ajani's Anguish's X is.
const RAVENOUS = ravenous();
const BLAST_TEXT = "Warp Blast — When this creature enters, it deals X damage to any target.";

export default defineCard({
  name: "Zoanthrope",
  manaCost: "{X}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text:
    "Ravenous (This creature enters with X +1/+1 counters on it. If X is 5 or more, draw a card when it enters.)\nFlying, ward {2}\n" +
    BLAST_TEXT,
  static: [RAVENOUS.static],
  triggered: [
    RAVENOUS.triggered,
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: BLAST_TEXT,
    },
  ],
});
