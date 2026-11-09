import { defineCard } from "../define.js";

// Layer 4 and 5 over every permanent, and its colour part over every card and
// spell anywhere else (rule 105.2c: colorless is having no colour). A {C}
// cost still wants colourless mana (rule 609.4b, as Chromatic Orrery's).
const TYPES = "All permanents are artifacts in addition to their other types.";
const COLORLESS = "All cards that aren't on the battlefield, spells, and permanents are colorless.";
const SPEND = "Players may spend mana as though it were mana of any color.";

export default defineCard({
  name: "Mycosynth Lattice",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${TYPES}\n${COLORLESS}\n${SPEND}`,
  static: [
    { affects: { scope: "filter", filter: {} }, addTypes: ["artifact"], text: TYPES },
    {
      affects: { scope: "filter", filter: {} },
      setColors: [],
      outsideBattlefield: { whose: "all", setColors: [] },
      text: COLORLESS,
    },
    { affects: { scope: "self" }, spendManaAs: { as: "any-color", everyone: true }, text: SPEND },
  ],
});
