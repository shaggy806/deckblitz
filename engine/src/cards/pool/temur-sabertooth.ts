import { defineCard } from "../define.js";

// EDHREC rank 1962.
//
// The creature is chosen, not targeted, as the ability resolves (the ruling);
// choosing none declines, and only a creature actually returned makes this one
// indestructible (Biblioplex Kraken's shape).
const TEXT =
  "{1}{G}: You may return another creature you control to its owner's hand. If you do, this creature gains indestructible until end of turn.";

export default defineCard({
  name: "Temur Sabertooth",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 0,
            upTo: 1,
            exceptSource: true,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "You may return another creature you control to its owner's hand",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
