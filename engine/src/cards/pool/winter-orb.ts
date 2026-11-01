import { defineCard } from "../define.js";

// Rulings:
//   [2016-06-08] All permanents untap during a player's untap step at once. If Winter Orb is tapped
//     as your untap step begins, your lands will all untap.

const TEXT = "As long as this artifact is untapped, players can't untap more than one land during their untap steps.";

export default defineCard({
  name: "Winter Orb",
  manaCost: "{2}",
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      untapLimit: { who: "each-player", count: 1, filter: { type: "land" } },
      text: TEXT,
    },
  ],
});
