import { defineCard } from "../define.js";

// EDHREC rank 10621.
//
// Rulings:
//   Damage prevention shields don't have any effect. If a prevention effect has an additional
//   effect, the additional effect will still work (if possible).
//   Effects that replace or redirect damage without using the word "prevent" are not affected
//   by Leyline of Punishment.
//
// - "Players can't gain life" is Forsaken Wastes'; "damage can't be
//   prevented" the `damageCantBePrevented` static over every source.
const NO_GAIN_TEXT = "Players can't gain life.";
const UNPREVENT_TEXT = "Damage can't be prevented.";

export default defineCard({
  name: "Leyline of Punishment",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `If this card is in your opening hand, you may begin the game with it on the battlefield.\n${NO_GAIN_TEXT}\n${UNPREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: NO_GAIN_TEXT,
    },
    { affects: { scope: "self" }, damageCantBePrevented: {}, text: UNPREVENT_TEXT },
  ],
});
