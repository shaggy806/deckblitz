import { defineCard } from "../define.js";

// EDHREC rank 11710.
//
// A `loseAllAbilities` static (layer 6) beside a base P/T (7b).
//
// Rulings:
//   [2006-02-01] With a Humility and two Opalescences on the battlefield, if Humility has the
//     latest timestamp, then all creatures are 1/1 with no abilities. If the timestamp order is
//     Opalescence, Humility, Opalescence, the second Opalescence is 1/1, and the Humility and
//     first Opalescence are 4/4. If Humility has the earliest timestamp, then everything is 4/4.
//   [2007-02-01] Removes all creature abilities. This includes mana abilities. Animated lands will
//     also lose the ability to tap for mana.
//   [2009-10-01] This is the current interaction between Humility and Opalescence: The
//     type-changing effect applies at layer 4, but the rest happens in the applicable layers. The
//     rest of it will apply even if the permanent loses its ability before it's finished applying.
//     So if Opalescence, Humility, and Worship are on the battlefield and Opalescence entered
//     before Humility, the following is true: Layer 4: Humility and Worship each become creatures
//     that are still enchantments. (Opalescence). Layer 6: Humility and Worship each lose their
//     abilities. (Humility) Layer 7b: Humility becomes 4/4 and Worship becomes 4/4. (Opalescence).
//     Humility becomes 1/1 and Worship becomes 1/1 (Humility). But if Humility entered before
//     Opalescence, the following is true: Layer 4: Humility and Worship each become creatures that
//     are still enchantments (Opalescence). Layer 6: Humility and Worship each lose their
//     abilities (Humility). Layer 7b: Humility becomes 1/1 and Worship becomes 1/1 (Humility).
//     Humility becomes 4/4 and Worship becomes 4/4 (Opalescence).

export default defineCard({
  name: "Humility",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "All creatures lose all abilities and have base power and toughness 1/1.",
  static: [
    {
      affects: { scope: "all-creatures" },
      loseAllAbilities: true,
      setBasePt: { power: 1, toughness: 1 },
      text: "All creatures lose all abilities and have base power and toughness 1/1.",
    },
  ],
});
