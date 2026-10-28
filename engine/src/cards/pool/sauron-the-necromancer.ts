import { defineCard } from "../define.js";

const TEXT =
  "Whenever Sauron attacks, exile target creature card from your graveyard. Create a tapped and attacking token that's a copy of that card, except it's a 3/3 black Wraith with menace. At the beginning of the next end step, exile that token unless Sauron is your Ring-bearer.";

export default defineCard({
  name: "Sauron, the Necromancer",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            tapped: true,
            attacking: "choose",
            // A Wraith instead of its other subtypes, black instead of its
            // colours, base 3/3 (the rulings), with menace.
            exceptions: { basePt: [3, 3], setColors: ["B"], setSubtypes: ["Wraith"], keywords: ["menace"] },
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "created",
            text: "Exile that token unless Sauron is your Ring-bearer.",
            // "Unless Sauron is your Ring-bearer" as this resolves — the same
            // Sauron: one that left the battlefield since doesn't save it,
            // even back or another copy (the rulings).
            effect: {
              kind: "conditional",
              condition: {
                kind: "all",
                of: [{ kind: "source-on-battlefield" }, { kind: "source", filter: { ringBearer: true } }],
              },
              then: { kind: "sequence", effects: [] },
              else: { kind: "exile", target: 0 },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
