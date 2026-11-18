import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 15084.
//
// Rulings:
//   This card will not prevent you from losing the game due to zero or less life.
//   If you were going to gain life and you also have a replacement that can turn card drawing
//     into life gain on the battlefield, you can gain life by using the Lich to turn the original
//     life gain into card drawing, and then using the other replacement to turn a card draw into
//     life gain. Nefarious Lich will not replace the life gain with a card draw again because it
//     has already acted on this event.
//
// Both replacements make the event something else (`instead: { effect }`, rules 614.1a, 614.6),
// "that many" being `"x"`. The damage isn't prevented, so damage that can't be prevented is
// replaced too. "Exile that many cards from your graveyard. If you can't, you lose the game" is
// Egon, God of Death's shape: with fewer cards than that, none is exiled (Egon's ruling on the
// same words) and you lose. A draw the life gain became isn't turned into a gain by this card
// again (614.5, the second ruling: the replacement's own effect isn't replaced by it).
const DAMAGE_TEXT = "If damage would be dealt to you, exile that many cards from your graveyard instead. If you can't, you lose the game.";
const GAIN_TEXT = "If you would gain life, draw that many cards instead.";
const LEAVES_TEXT = "When this enchantment leaves the battlefield, you lose the game.";

export default defineCard({
  name: "Nefarious Lich",
  manaCost: "{B}{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DAMAGE_TEXT}\n${GAIN_TEXT}\n${LEAVES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        instead: {
          effect: {
            kind: "conditional",
            condition: { kind: "amounts", left: { countInGraveyard: { ownedBy: "you" } }, op: "gte", right: "x" },
            then: { kind: "look-and-choose", zone: "graveyard", min: "x", max: "x", destination: "exile", leftover: "stay" },
            else: { kind: "lose-game" },
          },
        },
      },
      text: DAMAGE_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", instead: { effect: { kind: "draw", amount: "x" } } },
      text: GAIN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-game" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
