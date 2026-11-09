import { defineCard } from "../define.js";

export default defineCard({
  name: "Blind Fury",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "All creatures lose trample until end of turn. If a creature would deal combat damage to a creature this turn, it deals double that damage to that creature instead.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become", filter: { type: "creature" }, loseKeywords: ["trample"], duration: "end-of-turn" },
      {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: {
          event: "would-deal-damage",
          combat: true,
          source: { type: "creature" },
          toFilter: { type: "creature" },
          instead: { modify: { times: 2 } },
        },
      },
    ],
  },
});
