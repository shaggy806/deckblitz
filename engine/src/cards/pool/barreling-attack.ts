import { defineCard } from "../define.js";

// A delayed "when" watching the target (rule 603.7): cast after blockers are
// declared, it only grants trample (its ruling). The bonus counts the blockers
// as it resolves.
export default defineCard({
  name: "Barreling Attack",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gains trample until end of turn. When that creature becomes blocked this turn, it gets +1/+1 until end of turn for each creature blocking it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "becomes-blocked", who: "self" }, watching: 0, once: true },
        effect: {
          kind: "modify-pt",
          target: "trigger-object",
          power: { blockersOf: "trigger-object" },
          toughness: { blockersOf: "trigger-object" },
          duration: "end-of-turn",
        },
        text: "When that creature becomes blocked this turn, it gets +1/+1 until end of turn for each creature blocking it.",
      },
    ],
  },
});
