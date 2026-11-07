import { defineCard } from "../define.js";

// EDHREC rank 5228.
//
// Rulings:
//   If a cost includes life gain (like Invigorate's alternative cost does), that cost can't be
//   paid.
//   Spells and abilities that replace or redirect damage aren't affected by Everlasting
//   Torment's second ability. They'll work as normal.
//   The last ability affects all damage, whether it's dealt by creatures, other permanents,
//   spells, or cards that aren't on the battlefield. Wither works everywhere.
//   The "damage can't be prevented" statement overrides all forms of preventing damage,
//   including protection abilities.
//
// - "Players can't gain life" is Forsaken Wastes'; "damage can't be
//   prevented" Leyline of Punishment's; the last line the
//   `damageAsThoughSourceHad` static, which gives no source wither.
const NO_GAIN_TEXT = "Players can't gain life.";
const UNPREVENT_TEXT = "Damage can't be prevented.";
const WITHER_TEXT =
  "All damage is dealt as though its source had wither. (A source with wither deals damage to creatures in the form of -1/-1 counters.)";

export default defineCard({
  name: "Everlasting Torment",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${NO_GAIN_TEXT}\n${UNPREVENT_TEXT}\n${WITHER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: NO_GAIN_TEXT,
    },
    { affects: { scope: "self" }, damageCantBePrevented: {}, text: UNPREVENT_TEXT },
    { affects: { scope: "self" }, damageAsThoughSourceHad: { keyword: "wither" }, text: WITHER_TEXT },
  ],
});
