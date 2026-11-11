import { defineCard } from "../define.js";

// EDHREC rank 6722.
//
// - "You don't lose the game for having 0 or less life" is Lich's Tomb's
//   prohibition: rule 704.5a's loss alone, so ten poison counters (704.5c)
//   or an empty library still lose.
// - The second line is `damageAsThoughSourceHad` with `to: "you"` under a
//   life-total condition: at 0 or less life, damage dealt to you gives you
//   poison counters in place of loss of life (rules 120.3b, 702.90b). The
//   damage that takes you to 0 or less is itself all loss of life, however
//   many sources deal it at once (rule 510.2).
const NO_LOSS_TEXT = "You don't lose the game for having 0 or less life.";
const INFECT_TEXT =
  "As long as you have 0 or less life, all damage is dealt to you as though its source had infect. (Damage is dealt to you in the form of poison counters.)";

export default defineCard({
  name: "Phyrexian Unlife",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${NO_LOSS_TEXT}\n${INFECT_TEXT}`,
  static: [
    { affects: { scope: "self" }, prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }], text: NO_LOSS_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", who: "you", atMost: 0 },
      damageAsThoughSourceHad: { keyword: "infect", to: "you" },
      text: INFECT_TEXT,
    },
  ],
});
