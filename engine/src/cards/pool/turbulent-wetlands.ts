import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// Reality Fracture Commander (FRC). EDHREC rank 10048. Turbulent Moor's shape.
//
// Rulings:
//   [2026-08-21] Unlike some other dual lands, Turbulent Wetlands has two basic land types. It's
//     not basic, so effects that search for basic lands can't find it, but it does have the
//     appropriate land types for effects such as that of Drowned Catacomb (included in the Reality
//     Fracture Commander deck).
//   [2026-08-21] If this land enters the battlefield at the same time as any number of lands your
//     opponents control, those other lands are not counted when determining if this land enters
//     the battlefield tapped or untapped.

const TAPPED_TEXT = "This land enters tapped unless your opponents control eight or more lands.";

export default defineCard({
  name: "Turbulent Wetlands",
  colors: [],
  types: ["land"],
  subtypes: ["Island", "Swamp"],
  text: `({T}: Add {U} or {B}.)\n${TAPPED_TEXT}`,
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
  activated: [manaTapAbility("U"), manaTapAbility("B")],
});
