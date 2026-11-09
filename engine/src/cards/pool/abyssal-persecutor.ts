import { defineCard } from "../define.js";

// Platinum Angel the other way round: `cantWinGame` and `opponentsCantLoseGame`
// (rules 104.2a, 104.3a).

const TEXT = "You can't win the game and your opponents can't lose the game.";

export default defineCard({
  name: "Abyssal Persecutor",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TEXT}`,
  static: [{ affects: { scope: "self" }, text: TEXT, prohibits: [{ act: "lose-game", who: "opponents" }, { act: "win-game", who: "you" }] }],
});
