import { defineCard } from "../define.js";

// EDHREC rank 9357.
//
// - The two cards go back in any order, then you choose land or nonland,
//   and the opponent you choose guesses (the `guess` effect, rule 608.2d) —
//   the top card is revealed whatever they guessed (its ruling).
// - An empty library: no guess is right, so you draw from it (its ruling).

const ATTACK_TEXT =
  "Whenever Gollum attacks, look at the top two cards of your library, put them back in any order, then choose land or nonland. An opponent guesses whether the top card of your library is the chosen kind. Reveal that card. If they guessed right, remove Gollum from combat. Otherwise, you draw a card and Gollum can't be blocked this turn.";

export default defineCard({
  name: "Gollum, Scheming Guide",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Halfling", "Horror"],
  power: 2,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 2,
            min: 2,
            max: 2,
            destination: "library-top",
            leftover: "stay",
          },
          {
            kind: "choose-opponent",
            then: {
              kind: "guess",
              who: "that-player",
              about: "library-top",
              whether: [
                {
                  filter: { type: "land" },
                  choose: "Choose land",
                  yes: "Guess the top card of its controller's library is a land",
                  no: "Guess it isn't a land",
                },
                {
                  filter: { not: { type: "land" } },
                  choose: "Choose nonland",
                  yes: "Guess the top card of its controller's library is a nonland card",
                  no: "Guess it isn't a nonland card",
                },
              ],
              reveal: true,
              ifRight: { kind: "remove-from-combat", target: "source" },
              ifWrong: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: 1 },
                  { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
                ],
              },
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
