import { defineCard } from "../define.js";

// EDHREC rank 8711. Commander Legends (CMR).
//
// Two `others-enter-battlefield` replacements, each gated on Archelos's own
// tapped state. Neither ever applies to Archelos itself or to anything
// entering alongside it (the first ruling — the replacement's own rule). The
// "untapped" one beats an effect's "put it onto the battlefield tapped" and
// any other "enters tapped" (the third ruling: the entering permanent's
// controller orders the replacements, and applying Archelos last is the
// "enters untapped" they can always pick).
//
// Rulings:
//   [2020-11-10] Archelos's abilities don't apply to itself as it enters the battlefield, nor do
//     they apply to any permanents entering the battlefield at the same time.
//   [2020-11-10] If more than one Archelos is on the battlefield, the controller of an entering
//     permanent chooses how to order the replacement effects.
//   [2020-11-10] If another replacement effect says that a permanent enters the battlefield tapped
//     while Archelos is untapped, the entering permanent's controller chooses whether the
//     permanent enters tapped or untapped. If a permanent is simply put onto the battlefield
//     tapped without a replacement effect being applied, it always enters untapped if Archelos is
//     untapped.

const TAPPED_TEXT = "As long as Archelos is tapped, other permanents enter tapped.";
const UNTAPPED_TEXT = "As long as Archelos is untapped, other permanents enter untapped.";

export default defineCard({
  name: "Archelos, Lagoon Mystic",
  manaCost: "{1}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Turtle", "Shaman"],
  power: 2,
  toughness: 4,
  text: `${TAPPED_TEXT}\n${UNTAPPED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: true } },
      replacement: { event: "others-enter-battlefield", filter: {}, tapped: true },
      text: TAPPED_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      replacement: { event: "others-enter-battlefield", filter: {}, untapped: true },
      text: UNTAPPED_TEXT,
    },
  ],
});
