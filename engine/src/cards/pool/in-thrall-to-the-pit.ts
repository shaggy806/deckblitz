import { defineCard } from "../define.js";

const THREATEN = [
  { kind: "gain-control", target: 0, untilEndOfTurn: true },
  { kind: "untap", target: 0 },
  { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
] as const;

// Ruling (2022-09-09): cast kicked during an end step, the delayed trigger
// waits for the next turn's end step, by when you no longer control the
// creature, so it isn't sacrificed — `sacrifice-target` sacrifices only while
// the effect's controller controls it.
export default defineCard({
  name: "In Thrall to the Pit",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Kicker {2}{B} (You may pay an additional {2}{B} as you cast this spell.)\n" +
    "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. If this spell was kicked, sacrifice that creature at the beginning of the next end step.",
  targets: ["creature"],
  effect: { kind: "sequence", effects: [...THREATEN] },
  kicker: {
    cost: "{2}{B}",
    effect: {
      kind: "sequence",
      effects: [
        ...THREATEN,
        {
          kind: "delayed-trigger",
          at: "next-end-step",
          effect: { kind: "sacrifice-target", target: 0 },
          text: "Sacrifice the creature In Thrall to the Pit gained control of.",
        },
      ],
    },
  },
});
