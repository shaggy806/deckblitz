import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 2032.
//
// +2 is Kinetic Augur's "discard up to two cards, then draw that many" (zero
// is allowed — the ruling). −2 is Garruk, the Veil-Cursed's "sacrifice …. If
// you do": the artifact is chosen as it resolves (the ruling), the target
// chosen as it's activated. The −10 emblem's delayed return is Shirei's
// shape: "that card" is the delayed ability's trigger object, returned only
// while it's still that object in the graveyard (rule 400.7 — the ruling).
//
// Rulings:
//   [2014-11-07] The ability of Daretti's emblem will return the artifact card only if it's still
//     in your graveyard when the delayed triggered ability resolves at the beginning of the next
//     end step.
//   [2014-11-07] You choose which artifact to sacrifice as the second ability resolves.
//   [2014-11-07] You may choose to discard zero cards as the first ability resolves.

const PLUS_TEXT = "+2: Discard up to two cards, then draw that many cards.";
const MINUS_TEXT =
  "−2: Sacrifice an artifact. If you do, return target artifact card from your graveyard to the battlefield.";
const EMBLEM_TRIGGER_TEXT =
  "Whenever an artifact is put into your graveyard from the battlefield, return that card to the battlefield at the beginning of the next end step.";
const ULT_TEXT = `−10: You get an emblem with "${EMBLEM_TRIGGER_TEXT}"`;

const discardThenDraw = (n: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: n },
    { kind: "draw", amount: { thisWay: "discarded" } },
  ],
});

export default defineCard({
  name: "Daretti, Scrap Savant",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Daretti"],
  loyalty: 3,
  canBeCommander: true,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}\nDaretti, Scrap Savant can be your commander.`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Discard no cards", effect: { kind: "sequence", effects: [] } },
          { text: "Discard one card, then draw a card", effect: discardThenDraw(1) },
          { text: "Discard two cards, then draw that many cards", effect: discardThenDraw(2) },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", who: "you" },
            then: { kind: "put-onto-battlefield", target: 0 },
          },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TRIGGER_TEXT,
        triggered: [
          {
            trigger: { on: "dies", who: "any", filter: { type: "artifact", ownedBy: "you" } },
            targets: [],
            effect: {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "put-onto-battlefield", target: "trigger-object" },
              text: "Return that card to the battlefield.",
            },
            resolve: null,
            text: EMBLEM_TRIGGER_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
