import { defineCard } from "../define.js";

// Modern Horizons 3. One {E} as an `alternativeCostForSpells` for creature
// spells of mana value 3 or less, with `flash`: a spell cast for it may be
// begun any time an instant could (rule 601.3c), and only that cast — the
// same spell cast for its mana cost keeps its own timing. An {X} in its cost
// is 0 (the ruling, rule 107.3b), so its mana value is judged at X 0.
const ENTERS_TEXT = "When this enchantment enters, you get {E}{E} (two energy counters).";
const ALT_TEXT =
  "You may cast creature spells with mana value 3 or less by paying {E} rather than paying their mana costs. If you cast a spell this way, you may cast it as though it had flash.";

export default defineCard({
  name: "Primal Prayers",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${ALT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        energy: 1,
        filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        flash: true,
      },
      text: ALT_TEXT,
    },
  ],
});
