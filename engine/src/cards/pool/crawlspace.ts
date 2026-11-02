import { defineCard } from "../define.js";

// Rule 508.1c. Attacks on the controller's planeswalkers aren't counted (the
// ruling), and its own controller's attacks aren't either.
const TEXT = "No more than two creatures can attack you each combat.";

export default defineCard({
  name: "Crawlspace",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, attackLimit: { most: 2, covers: "you" }, text: TEXT }],
});
