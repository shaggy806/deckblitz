import { defineCard } from "../define.js";

// "You control each creature with the greatest power": no opponent controls
// one, so a tie with an opponent's creature fails it. With no creature at all
// there's no creature an opponent controls to target.
const TEXT =
  "At the beginning of combat on your turn, if you control each creature on the battlefield with the greatest power, gain control of target creature an opponent controls until end of turn. Untap that creature. It gains haste until end of turn.";

export default defineCard({
  name: "Might Makes Right",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TEXT} (It can attack and {T} this turn.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: {
        kind: "not",
        of: {
          kind: "opponent-controls",
          atLeast: 1,
          filter: { type: "creature", greatestInZone: { of: "power", among: { type: "creature" } } },
        },
      },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
