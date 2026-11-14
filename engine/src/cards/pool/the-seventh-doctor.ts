import { defineCard } from "../define.js";

// EDHREC rank 11426.
//
// - The card is chosen from your hand face down (its ruling): a
//   `look-and-choose` of your hand that stays, shown to nobody. The defending
//   player guesses (the `guess` effect, rule 608.2d) against the number of
//   artifacts you control as the guess is judged; an {X} in its mana cost is
//   0 (rule 202.3e). Nobody learns whether they were right unless it's cast.
// - "If you don't cast a spell this way": a right guess, a wrong one you
//   decline, or nothing castable — each investigates.

const ATTACK_TEXT =
  "Whenever The Seventh Doctor attacks, choose a card in your hand. Defending player guesses whether that card's mana value is greater than the number of artifacts you control. If they guessed wrong, you may cast it without paying its mana cost. If you don't cast a spell this way, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

const INVESTIGATE = { kind: "create-token", token: "Clue Token", count: 1, investigate: true } as const;

export default defineCard({
  name: "The Seventh Doctor",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Time Lord", "Doctor"],
  power: 3,
  toughness: 6,
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
            zone: "hand",
            min: 1,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt:
              "Choose a card in your hand — the defending player guesses whether its mana value is greater than the number of artifacts you control",
          },
          {
            kind: "guess",
            who: "trigger-player",
            about: "chosen-this-way",
            whether: [
              {
                filter: { manaValue: { op: "gt", n: { amount: { countOf: { type: "artifact", controlledBy: "you" } } } } },
                yes: "Guess the chosen card's mana value is greater than the number of artifacts its controller controls",
                no: "Guess it isn't",
              },
            ],
            ifRight: INVESTIGATE,
            ifWrong: { kind: "cast-now", from: "chosen-this-way", free: true, else: INVESTIGATE },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
