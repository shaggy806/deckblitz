import { defineCard } from "../define.js";

// Edge of Eternities (EOE).
//
// Not targeted: each opponent in turn order chooses a creature they control,
// if they control any, and every chosen one is exiled at once, linked to
// Sothera (rule 607.2a). The end-step ability is an intervening "if" (rule
// 603.4): checked as the end step begins and again as it resolves (the
// ruling). It still finds the cards exiled with Sothera once it has been
// sacrificed — the stint the ability came from.

const DIES_TEXT = "Whenever a creature you control dies, each opponent chooses a creature they control and exiles it.";
const END_TEXT =
  "At the beginning of your end step, if a player controls no creatures, sacrifice Sothera, then put a creature card exiled with it onto the battlefield under your control with two additional +1/+1 counters on it.";

export default defineCard({
  name: "Sothera, the Supervoid",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${DIES_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: "each-opponent",
            for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
          },
          {
            kind: "for-each-voted",
            which: "voted",
            simultaneous: true,
            effect: { kind: "exile", target: 0, linked: true },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "of-player",
        player: "a-player",
        condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          {
            kind: "look-and-choose",
            zone: "exiled-with-source",
            min: 1,
            max: 1,
            filter: { type: "creature" },
            destination: "battlefield",
            leftover: "stay",
            withCounters: { kind: "+1/+1", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
