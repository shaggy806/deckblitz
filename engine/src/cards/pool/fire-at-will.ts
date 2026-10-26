import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 29535.
//
// Deft Dismissal's shape: one to three targets, attacking or blocking, the
// division chosen as it's cast with at least 1 to each (the rulings).

export default defineCard({
  name: "Fire at Will",
  manaCost: "{R/W}{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Fire at Will deals 3 damage divided as you choose among one, two, or three target attacking or blocking creatures.",
  targets: [{ kind: "any-number", of: "attacking-or-blocking-creature", min: 1, max: 3 }],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
