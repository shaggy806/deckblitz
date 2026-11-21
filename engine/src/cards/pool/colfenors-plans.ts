import { defineCard } from "../define.js";

// EDHREC rank 19636.
//
// Rulings:
//   [2007-10-01] Playing a card exiled with Colfenor's Plans follows all the normal rules for
//     playing that card. You must pay its costs, and you must follow all timing restrictions, for
//     example.
//   [2007-10-01] The turn you cast Colfenor's Plans, you have cast (at least) one spell that turn.
//     After it enters and its last ability goes into effect, you can't cast any more spells that
//     turn.
//   [2007-10-01] If an exiled card has morph, you may cast it face down.
//   [2013-04-15] If Colfenor's Plans leaves the battlefield, you can continue to look at cards
//     exiled by it, but you can no longer play them.
// The cards are exiled face down and linked to this enchantment (rule 607.2a):
// `faceDown: "linked-controller"` lets its controller look, and whoever comes
// to control it after, each going on looking once allowed (406.3) — even
// once it has left. Playing them is the linked `mayPlay`, its controller's
// for as long as it's on the battlefield (406.3b).

const ENTERS_TEXT = "When this enchantment enters, exile the top seven cards of your library face down.";
const PLAY_TEXT =
  "You may look at the cards exiled with this enchantment, and you may play lands and cast spells from among those cards.";
const SKIP_TEXT = "Skip your draw step.";
const LIMIT_TEXT = "You can't cast more than one spell each turn.";

export default defineCard({
  name: "Colfenor's Plans",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${PLAY_TEXT}\n${SKIP_TEXT}\n${LIMIT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", amount: 7, faceDown: "linked-controller", linked: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: PLAY_TEXT,
      mayPlay: { from: "exile", play: true, filter: {}, linked: true },
    },
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: SKIP_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "you", limit: 1 }],
      text: LIMIT_TEXT,
    },
  ],
});
