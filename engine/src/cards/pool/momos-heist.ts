import { defineCard } from "../define.js";

// EDHREC rank 16512. The control change and the haste have no duration: they
// last until the artifact leaves. `sacrifice-target` sacrifices only while
// the effect's controller still controls it (rule 701.21a).
export default defineCard({
  name: "Momo's Heist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target artifact. Untap it. It gains haste. At the beginning of the next end step, sacrifice it.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: { kind: "sacrifice-target", target: 0 },
        text: "Sacrifice the artifact Momo's Heist gained control of.",
      },
    ],
  },
});
