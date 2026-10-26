import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 13157.
//
// Goatnapper's order on any permanent: untap it, gain control of it until end
// of turn, then haste until end of turn.
export default defineCard({
  name: "Word of Seizing",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nUntap target permanent and gain control of it until end of turn. It gains haste until end of turn.",
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
