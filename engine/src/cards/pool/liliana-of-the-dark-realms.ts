import { defineCard } from "../define.js";

// EDHREC rank 2146.
//
// Rulings:
//   [2012-07-01] You can activate Liliana's first ability even if your library contains no Swamp
//     cards (or you don't want to find one). You'll still search your library and shuffle it.
//   [2012-07-01] When you activate Liliana's second ability, you choose only the target creature.
//     You choose whether that creature gets +X/+X or -X/-X when the ability resolves. The value of
//     X is determined by the number of Swamps you control when the ability resolves.
//   [2012-07-01] Liliana's emblem doesn't remove any other abilities of Swamps you control.
//   [2013-07-01] Each of Liliana's abilities refers to lands (or land cards) with the subtype
//     Swamp, not just ones named Swamp.

const SWAMPS = { countOf: { subtype: "Swamp", controlledBy: "you" } } as const;
const MINUS_SWAMPS = { product: [SWAMPS, -1] } as const;

export default defineCard({
  name: "Liliana of the Dark Realms",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 3,
  text: "+1: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.\n−3: Target creature gets +X/+X or -X/-X until end of turn, where X is the number of Swamps you control.\n−6: You get an emblem with \"Swamps you control have '{T}: Add {B}{B}{B}{B}.'\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Swamp" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "+1: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      // The ruling: only the target is chosen on activation; +X/+X or -X/-X
      // is chosen as it resolves, and X counted then — a `modal` asked at
      // resolution (Twiddle's "tap or untap"), not an announced one.
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "+X/+X",
            effect: { kind: "modify-pt", target: 0, power: SWAMPS, toughness: SWAMPS, duration: "end-of-turn" },
          },
          {
            text: "-X/-X",
            effect: { kind: "modify-pt", target: 0, power: MINUS_SWAMPS, toughness: MINUS_SWAMPS, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: "−3: Target creature gets +X/+X or -X/-X until end of turn, where X is the number of Swamps you control.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Swamps you control have '{T}: Add {B}{B}{B}{B}.'",
        static: {
          affects: { scope: "filter", filter: { subtype: "Swamp", controlledBy: "you" } },
          grantsActivated: [
            {
              cost: { mana: null, tap: true },
              targets: [],
              effect: { kind: "add-mana", mana: "B", amount: 4 },
              resolve: null,
              text: "{T}: Add {B}{B}{B}{B}.",
            },
          ],
          text: "Swamps you control have '{T}: Add {B}{B}{B}{B}.'",
        },
      },
      resolve: null,
      text: "−6: You get an emblem with \"Swamps you control have '{T}: Add {B}{B}{B}{B}.'\"",
    },
  ],
});
