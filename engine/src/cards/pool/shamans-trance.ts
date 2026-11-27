import { defineCard } from "../define.js";

// EDHREC rank 26158.
//
// Rulings:
//   This card does not allow you to activate the abilities of cards in other
//     people's graveyards.
//   You can use Flashback on cards to cast them.
//
// - "Other players can't … from their graveyards": a card each of them owns,
//   where it is as the cast or the land play begins (rule 601.2a) — the
//   `prohibit` effect, its filter read from the caster of Shaman's Trance's
//   side (`ownedBy: "opponent"`).
// - "As though those cards were in your graveyard": `asThoughYours`, so the
//   cards' own flashback (and every other "from your graveyard" keyword) is
//   the caster's to use, beside the plain permission.

export default defineCard({
  name: "Shaman's Trance",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Other players can't play lands or cast spells from their graveyards this turn. You may play lands and cast spells from other players' graveyards this turn as though those cards were in your graveyard.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "prohibit",
        prohibits: [
          { act: "cast", who: "each-opponent", from: ["graveyard"], filter: { ownedBy: "opponent" } },
          { act: "play-land", who: "each-opponent", from: ["graveyard"], filter: { ownedBy: "opponent" } },
        ],
      },
      {
        kind: "player-effect",
        duration: "end-of-turn",
        mayPlay: { from: "graveyard", play: true, whose: { otherThan: "you" }, asThoughYours: true },
      },
    ],
  },
});
