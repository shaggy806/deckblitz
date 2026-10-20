import { defineCard } from "../define.js";

export default defineCard({
  name: "Pack's Betrayal",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. If you control a Wolf or Werewolf, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtypes: ["Wolf", "Werewolf"] }, atLeast: 1 },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});
