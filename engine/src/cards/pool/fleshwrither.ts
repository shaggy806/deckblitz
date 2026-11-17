import { defineCard } from "../define.js";
import { transfigure } from "../helpers.js";

// EDHREC rank 12304. Future Sight.
//
// Rulings:
//   Transfigure is similar to Transmute, though it can be activated only if
//     the permanent with Transfigure is on the battlefield, and it can fetch
//     only a creature.
//
// Transfigure (rule 702.71a) is the `transfigure` helper: sacrificed as the
// cost, it searches for a creature card with its mana value as it last
// existed on the battlefield.

export default defineCard({
  name: "Fleshwrither",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  text: "Transfigure {1}{B}{B} ({1}{B}{B}, Sacrifice this creature: Search your library for a creature card with the same mana value as this creature, put that card onto the battlefield, then shuffle. Transfigure only as a sorcery.)",
  activated: [transfigure("{1}{B}{B}")],
});
