import { defineCard } from "../define.js";

// EDHREC rank 2151.
//
// Its loyalty abilities may be activated any time its controller has
// priority, on any player's turn (`loyaltyAtInstantSpeed`), still only one
// of them per turn (rule 606.3) — the first ability changes nothing else.
// The −3 phases the creature out until its controller's next untap step
// (rule 702.26b), with what's attached to it.
const INSTANT = "You may activate loyalty abilities of Teferi on any player's turn any time you could cast an instant.";
const PLUS = "+1: Draw a card, then discard a card.";
const MINUS =
  "−3: Target creature you don't control phases out. (Treat it and anything attached to it as though they don't exist until its controller's next turn.)";
const ULTIMATE = "−10: Take two extra turns after this one.";

export default defineCard({
  name: "Teferi, Master of Time",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 3,
  text: `${INSTANT}\n${PLUS}\n${MINUS}\n${ULTIMATE}`,
  static: [{ affects: { scope: "self" }, loyaltyAtInstantSpeed: true, text: INSTANT }],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "phase-out", target: 0 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "take-extra-turn" }, { kind: "take-extra-turn" }],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
