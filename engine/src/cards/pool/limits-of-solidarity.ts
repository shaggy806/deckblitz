import { defineCard } from "../define.js";

export default defineCard({
  name: "Limits of Solidarity",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
