import { defineCard } from "../define.js";

const FACES = ["Push // Pull", "Push", "Pull"];
const PULL_TEXT =
  "Put up to two target creature cards from a single graveyard onto the battlefield under your control. They gain haste until end of turn. Sacrifice them at the beginning of the next end step.";

export default defineCard({
  name: "Pull",
  manaCost: "{4}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: PULL_TEXT,
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } },
      max: 2,
      sameController: true,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      },
      // One delayed ability for both, about what this put onto the battlefield.
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        about: "put-onto-battlefield",
        effect: {
          kind: "for-each-target",
          from: 0,
          simultaneous: true,
          effect: { kind: "sacrifice-target", target: 0 },
        },
        text: "Sacrifice them.",
      },
    ],
  },
  faces: FACES,
  split: true,
});
