import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 4400. The +1's three targets are each optional; each one still
// legal is untapped if you control it as the ability resolves and tapped
// otherwise, and you gain 2 life while any target remains (the ruling). The
// emblem's two lines are statics with no stack: your permanents untap with
// the opponent's in their untap step (Seedborn Muse's rule, read off the
// emblem), and in their draw step you draw after they do, before anyone has
// priority (`drawsInOpponentsDrawStep`).
//
// Rulings:
//   - If you create an emblem with the last ability, your permanents will untap at the same time
//     as your opponent's permanents during their untap step. They will draw a card during their
//     draw step and then you will draw a card during their draw step. No player gets priority to
//     cast spells or activate abilities between those card draws.
//   - If one or more targets are illegal as the first ability resolves, but at least one target
//     is still legal, the ability will affect only the remaining legal targets and you'll gain 2
//     life.

const PLUS =
  "+1: Choose up to one target artifact, up to one target creature, and up to one target land. Untap the chosen permanents you control. Tap the chosen permanents you don't control. You gain 2 life.";
const MINUS =
  "−2: Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";
const UNTAP_EMBLEM = "Untap all permanents you control during each opponent's untap step";
const DRAW_EMBLEM = "You draw a card during each opponent's draw step.";
const ULT = `−7: You get an emblem with "${UNTAP_EMBLEM}" and "${DRAW_EMBLEM}"`;

/** Untap it if you control it, tap it if you don't. */
const untapOrTap = (index: number): EffectSpec => ({
  kind: "conditional",
  condition: { kind: "target-controlled-by-you", index },
  then: { kind: "untap", target: index },
  else: { kind: "tap", target: index },
});

export default defineCard({
  name: "Teferi, Who Slows the Sunset",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "artifact" },
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "permanent", filter: { type: "land" } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sequence", simultaneous: true, effects: [untapOrTap(0), untapOrTap(1), untapOrTap(2)] },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: `${UNTAP_EMBLEM}. ${DRAW_EMBLEM}`,
        static: { affects: { scope: "self" }, untapsDuringOthersUntap: {}, text: UNTAP_EMBLEM },
        moreStatics: [{ affects: { scope: "self" }, drawsInOpponentsDrawStep: true, text: DRAW_EMBLEM }],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
