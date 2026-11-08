import { defineCard } from "../define.js";

export default defineCard({
  name: "Awaken the Sleeper",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. If it's equipped, you may destroy all Equipment attached to that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { equipped: true } },
        then: {
          kind: "may",
          prompt: "Destroy all Equipment attached to that creature?",
          effect: { kind: "destroy-all", filter: { subtype: "Equipment", attachedToObject: 0 } },
        },
      },
    ],
  },
});
