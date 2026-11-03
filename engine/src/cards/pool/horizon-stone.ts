import { defineCard } from "../define.js";

// Fifth Dawn.
//
// Kruphix, God of Horizons's replacement alone (`unspentManaBecomesColorless`, rule 614): every
// unit you would lose as a step or phase ends stays in your pool as colorless mana, its
// restrictions and riders kept.

const TEXT = "If you would lose unspent mana, that mana becomes colorless instead.";

export default defineCard({
  name: "Horizon Stone",
  manaCost: "{5}",
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, unspentManaBecomesColorless: true, text: TEXT }],
});
