import { defineCard } from "../define.js";

// EDHREC rank 26637.
//
// Rulings:
//   [2004-12-01] You sacrifice the permanents before Shimatsu enters, so you can't sacrifice any
//     creatures that enter at the same time it does.
//
// "As this enters, sacrifice any number of permanents; it enters with that
// many +1/+1 counters" is devour's replacement exactly (rule 702.82a) over
// any permanent rather than creatures: the `devour` field with an empty
// filter and a multiplier of 1. The engine offers only permanents already
// on the battlefield, not one entering alongside it — the ruling.

export default defineCard({
  name: "Shimatsu the Bloodcloaked",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 0,
  toughness: 0,
  text: "As Shimatsu enters, sacrifice any number of permanents. Shimatsu enters with that many +1/+1 counters on it.",
  devour: { multiplier: 1, filter: {} },
});
