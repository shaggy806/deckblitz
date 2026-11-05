import { defineCard } from "../define.js";

export default defineCard({
  name: "Evil's Thrall",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. If you control a Villain with greater mana value than that creature, gain control of that creature until the end of your next turn instead. Untap that creature. It gains haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { subtype: "Villain", manaValue: { op: "gt", n: { amount: { manaValueOf: 0 } } } },
          atLeast: 1,
        },
        then: { kind: "gain-control", target: 0, untilEndOfTurn: false, until: "until-end-of-your-next-turn" },
        else: { kind: "gain-control", target: 0, untilEndOfTurn: true },
      },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
