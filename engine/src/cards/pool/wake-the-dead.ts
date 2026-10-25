import { defineCard } from "../define.js";

// EDHREC rank 8440. Commander 2014.
//
// "X target creature cards" is an `any-number` group fixed at X (Back in
// Town's shape), returned together; the delayed sacrifice is about exactly the
// permanents this put onto the battlefield (`about`, Rally the Ancestors'
// shape) and fires once (the ruling) — one that changed controller isn't
// sacrificed by you, and one that left and came back is a new object.

export default defineCard({
  name: "Wake the Dead",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Cast this spell only during combat on an opponent's turn.\nReturn X target creature cards from your graveyard to the battlefield. Sacrifice those creatures at the beginning of the next end step.",
  castOnlyIf: {
    kind: "all",
    of: [{ kind: "not", of: { kind: "your-turn" } }, { kind: "turn-structure", duringCombat: true }],
  },
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
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
        text: "Sacrifice those creatures.",
      },
    ],
  },
});
