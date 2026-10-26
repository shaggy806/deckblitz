import { defineCard } from "../define.js";

// EDHREC rank 15793. Breaker of Armies' lure on itself; the Channel ability
// (a hand ability that discards the card as its cost — Twinshot Sniper's
// shape) is Alluring Scent.
const LURE_TEXT = "All creatures able to block this creature do so.";
const CHANNEL_TEXT =
  "Channel — {2}{G}{G}, Discard this card: All creatures able to block target creature this turn do so.";

export default defineCard({
  name: "Shinen of Life's Roar",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 2,
  text: `${LURE_TEXT}\n${CHANNEL_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-be-blocked"], text: LURE_TEXT }],
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
});
