import { defineCard } from "../define.js";

// EDHREC rank 29686.
// The delayed destroy has no target of its own (rule 603.7c): it destroys the
// creature the ability targeted even if it's no longer a creature, no longer
// yours or no longer smaller than the Giant's power (the 2009-10-01 ruling).

export default defineCard({
  name: "Stone Giant",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 4,
  text: "{T}: Target creature you control with toughness less than this creature's power gains flying until end of turn. Destroy that creature at the beginning of the next end step.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            controlledBy: "you",
            toughness: { op: "lt", n: { amount: { powerOf: "source" } } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "destroy", target: 0 },
            text: "Destroy that creature.",
          },
        ],
      },
      resolve: null,
      text: "{T}: Target creature you control with toughness less than this creature's power gains flying until end of turn. Destroy that creature at the beginning of the next end step.",
    },
  ],
});
