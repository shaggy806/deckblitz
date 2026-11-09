import { defineCard } from "../define.js";

// Cliffside Rescuer's protection from each of your opponents; fateful hour read as it
// resolves, as a player effect for the turn.

export default defineCard({
  name: "Courageous Resolve",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Up to one target creature you control gains protection from each of your opponents until end of turn. Draw a card. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything controlled by those players.)\n" +
    "Fateful hour — If you have 5 or less life, you can't lose life this turn, you can't lose the game this turn, and your opponents can't win the game this turn.",
  targets: [{ kind: "optional", of: "creature-you-control" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-protection", target: 0, from: { fromPlayers: "opponents" }, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "life-total", atMost: 5 },
        then: { kind: "prohibit", prohibits: [{ act: "lose-game", who: "you" }, { act: "win-game", who: "each-opponent" }, { act: "lose-life", who: "you" }], duration: "end-of-turn" },
      },
    ],
  },
});
