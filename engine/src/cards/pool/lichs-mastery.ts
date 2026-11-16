import { defineCard } from "../define.js";

// EDHREC rank 7967.
//
// "For each 1 life you lost": that many things, any mix of permanents you
// control and cards from your hand and graveyard (its ruling — "one
// permanent, two cards from hand, and two cards from your graveyard"),
// chosen together and exiled at once — the `exile-from-zones` effect. With
// no more than that to give, everything goes, this enchantment too, and then
// its last ability loses you the game (its rulings). Its effects don't
// replace the life gain or loss (its ruling): they're triggers.

const LOSE_TEXT = "You can't lose the game.";
const GAIN_TEXT = "Whenever you gain life, draw that many cards.";
const EXILE_TEXT =
  "Whenever you lose life, for each 1 life you lost, exile a permanent you control or a card from your hand or graveyard.";
const LEAVES_TEXT = "When Lich's Mastery leaves the battlefield, you lose the game.";

export default defineCard({
  name: "Lich's Mastery",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  keywords: ["hexproof"],
  text: `Hexproof\n${LOSE_TEXT}\n${GAIN_TEXT}\n${EXILE_TEXT}\n${LEAVES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "lose-game", who: "you" }],
      text: LOSE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: { triggerValue: true } },
      resolve: null,
      text: GAIN_TEXT,
    },
    {
      trigger: { on: "loses-life", who: "you" },
      targets: [],
      effect: {
        kind: "exile-from-zones",
        zones: ["battlefield", "hand", "graveyard"],
        count: { triggerValue: true },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-game" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
