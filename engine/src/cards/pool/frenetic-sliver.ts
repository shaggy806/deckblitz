import { defineCard } from "../define.js";

// Planar Chaos. "All Slivers" — every player's (Acidic Sliver's shape). The
// "if this permanent is on the battlefield" gate is what makes several
// activations in response to each other flip only one coin (the ruling): once
// the first has exiled or sacrificed it, the rest find it gone and do nothing.
const GRANTED =
  "{0}: If this permanent is on the battlefield, flip a coin. If you win the flip, exile this permanent and return it to the battlefield under its owner's control at the beginning of the next end step. If you lose the flip, sacrifice it.";
const TEXT = `All Slivers have "${GRANTED}"`;

export default defineCard({
  name: "Frenetic Sliver",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{0}", tap: false },
          targets: [],
          effect: {
            kind: "conditional",
            condition: { kind: "source-on-battlefield" },
            then: {
              kind: "flip-coin",
              won: {
                kind: "flicker",
                target: "source",
                returnAt: "next-end-step",
                returnText: "Return it to the battlefield under its owner's control.",
              },
              lost: { kind: "sacrifice-source" },
            },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
