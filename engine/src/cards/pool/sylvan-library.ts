import { defineCard } from "../define.js";

// EDHREC rank 258.
//
// Rulings:
//   [2004-10-04] Any cards drawn prior to Sylvan Library's ability resolving, including in your
//     upkeep or in response to Sylvan Library's triggered ability, can be chosen to be put back
//     using this effect.
//   [2004-10-04] If you choose to draw two cards, then replace one or more of those draws with some
//     other effect, the rest of Sylvan Library's ability still happens. If you've actually drawn
//     only one card that turn, you must choose that card and either pay 4 life or put it on top of
//     your library. If you haven't actually drawn any cards that turn, the rest of the ability has
//     no effect.
//   [2004-10-04] If you control more than one Sylvan Library, the triggered ability of each will
//     resolve in sequence. You don't get to draw all the cards at once and then put them all back
//     at once.
//   [2004-10-04] You always perform your normal draw before this ability.
//   [2021-03-19] You can put back zero, one, or two cards.
//   [2021-03-19] It's not possible to take any actions between drawing the cards and choosing two
//     cards. You can't cast the cards you drew to avoid having two cards to choose.
//
// "For each of those cards" goes in the order they were picked: the second one
// put back ends up on top of the first, so the pick is the order (rule 401.4).

const TEXT =
  "At the beginning of your draw step, you may draw two additional cards. If you do, choose two cards in your hand drawn this turn. For each of those cards, pay 4 life or put the card on top of your library.";

export default defineCard({
  name: "Sylvan Library",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw two additional cards?",
        effect: { kind: "draw", amount: 2 },
        then: {
          kind: "look-and-choose",
          zone: "hand",
          min: 2,
          max: 2,
          filter: { drawnThisTurn: true },
          destination: "stay",
          leftover: "stay",
          prompt: "Choose two cards in your hand drawn this turn. For each, in the order you pick them: pay 4 life or put it on top of your library",
          givesUp: true,
          then: {
            kind: "for-each-target",
            from: 0,
            effect: {
              kind: "may",
              prompt: "Pay 4 life? If you don't, put this card on top of your library",
              aboutTarget: 0,
              costLife: 4,
              effect: { kind: "sequence", effects: [] },
              else: { kind: "put-on-library", target: 0, position: "top" },
            },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
