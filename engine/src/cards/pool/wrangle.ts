import { defineCard } from "../define.js";

// EDHREC rank 13102. The power check is a targeting restriction only: a
// creature whose power grows past 4 as you gain control of it is still yours,
// untapped and hasty (the ruling).

export default defineCard({
  name: "Wrangle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature with power 4 or less until end of turn. Untap that creature. It gains haste until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 4 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
