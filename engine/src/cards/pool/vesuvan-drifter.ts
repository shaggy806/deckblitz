import { defineCard } from "../define.js";

// EDHREC rank 10846.
//
// Rulings:
//   [2023-05-12] If the copied creature card has {X} in its mana cost, X is 0.
//   [2023-05-12] Vesuvan Drifter lets you look at the top card of your library whenever you want
//     (with one restriction—see below), even if you don't have priority. This action doesn't use
//     the stack. Knowing what that card is becomes part of the information you have access to,
//     just like you can look at the cards in your hand.
//   [2023-05-12] Any non-copy effect that began to apply to Vesuvan Drifter before it became a
//     copy of a creature card will continue to apply to it after it becomes a copy. Auras and
//     Equipment attached to Vesuvan Drifter will continue to work, as well as counters that change
//     its power and toughness.
//   [2023-05-12] Notably, while Vesuvan Drifter is a copy of another card, it doesn't have its own
//     abilities. You won't be able to look at the top card of your library unless another effect
//     allows you to do so.
//   [2023-05-12] Vesuvan Drifter copies exactly what was printed on the original creature card and
//     nothing else, except it has flying.
//   [2023-05-12] If the top card of your library changes while you're casting a spell, playing a
//     land, or activating an ability, you can't look at the new top card until you finish doing
//     so. This means that if you cast the top card of your library, you can't look at the next one
//     until you're done paying for that spell.
//
// The look is `looksAtOwnLibraryTop` (Verge Rangers), read through the object's rules text, so a
// Drifter that has become a copy of something else no longer has it (the fourth ruling). The
// reveal is Elven Farsight's `reveal-top` with the card as target 0; the copy is of the card's
// printed values (become-copy of a card in a library), until end of turn, plus flying.

const LOOK_TEXT = "You may look at the top card of your library any time.";
const COMBAT_TEXT =
  "At the beginning of each combat, you may reveal the top card of your library. If you reveal a creature card this way, this creature becomes a copy of that card until end of turn, except it has flying.";

export default defineCard({
  name: "Vesuvan Drifter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${LOOK_TEXT}\n${COMBAT_TEXT}`,
  looksAtOwnLibraryTop: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal the top card of your library?",
        effect: {
          kind: "reveal-top",
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: {
              kind: "become-copy",
              target: "source",
              of: 0,
              until: "end-of-turn",
              exceptions: { keywords: ["flying"] },
            },
          },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
