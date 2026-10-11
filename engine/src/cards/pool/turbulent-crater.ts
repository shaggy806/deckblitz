import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// EDHREC rank 10626. Turbulent Moor's shape.
//
// Rulings:
//   [2026-08-21] Unlike some other dual lands, Turbulent Crater has two basic land types. It's not
//     basic, so effects that search for basic lands can't find it, but it does have the
//     appropriate land types for effects such as that of Dragonskull Summit.
//   [2026-08-21] If this land enters the battlefield at the same time as any number of lands your
//     opponents control, those other lands are not counted when determining if this land enters
//     the battlefield tapped or untapped.

const TAPPED_TEXT = "This land enters tapped unless your opponents control eight or more lands.";

export default defineCard({
  name: "Turbulent Crater",
  colors: [],
  types: ["land"],
  subtypes: ["Swamp", "Mountain"],
  text: `({T}: Add {B} or {R}.)\n${TAPPED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: {
          kind: "opponents-control-total",
          filter: { type: "land" },
          atLeast: 8,
        },
      },
      text: TAPPED_TEXT,
    },
  ],
  activated: [manaTapAbility("B"), manaTapAbility("R")],
});
