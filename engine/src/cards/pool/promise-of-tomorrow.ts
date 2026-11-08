import { defineCard } from "../define.js";

// EDHREC rank 16785. Each creature card is exiled linked to this (rule
// 607.2a) — only the Promise whose trigger exiled it can return it (the
// ruling). The end-step trigger's "if you control no creatures" is an
// intervening if, read again as it resolves; it sacrifices this, then *puts*
// the linked cards onto the battlefield under its controller's control.
//
// Rulings:
//   If a creature you control dies, but it isn't a creature card in the graveyard, Promise of
//     Tomorrow will still exile it, and it may return it to the battlefield later.
//   If you control more than one Promise of Tomorrow, … The next ability to try and resolve will
//     check to see if you control any creatures at that time. If you do, the ability won't resolve.

const DIES_TEXT = "Whenever a creature you control dies, exile it.";
const END_TEXT =
  "At the beginning of each end step, if you control no creatures, sacrifice this enchantment and return all cards exiled with it to the battlefield under your control.";

export default defineCard({
  name: "Promise of Tomorrow",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${DIES_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", linked: true },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "return-exiled-by-source", linked: "battlefield", under: "you" },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
