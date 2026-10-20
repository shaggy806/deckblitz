import { defineCard } from "../define.js";

const LOCK = "You can't lose the game and your opponents can't win the game.";
const COUNTERS_TEXT = "Creatures you control can't have -1/-1 counters put on them.";

// Platinum Angel's lock (`cantLoseGame` / `opponentsCantWinGame`), and Melira's
// -1/-1 line (`preventsCounters`): infect and wither damage leave nothing on
// your creatures, and a persist creature comes back with no counter.
export default defineCard({
  name: "Darksteel Angel",
  manaCost: "{9}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "indestructible"],
  text: `Flying, indestructible\n${LOCK}\n${COUNTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantLoseGame: true,
      opponentsCantWinGame: true,
      text: LOCK,
    },
    {
      affects: { scope: "self" },
      preventsCounters: { permanents: { type: "creature", controlledBy: "you" }, kind: "-1/-1" },
      text: COUNTERS_TEXT,
    },
  ],
});
