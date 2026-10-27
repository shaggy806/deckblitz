import { defineCard } from "../define.js";

const FACES = ["Order // Chaos", "Order", "Chaos"];

// The right half of Order // Chaos (see order-chaos.ts). A `restrict` with a
// filter is a rule for the rest of the turn, so a creature that enters after
// Chaos resolves can't block either (rule 611.2c, its ruling); blocks already
// declared stay.
export default defineCard({
  name: "Chaos",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Creatures can't block this turn.",
  targets: [],
  effect: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-block"] },
  faces: FACES,
  split: true,
});
