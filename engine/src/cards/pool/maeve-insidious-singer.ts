import { defineCard } from "../define.js";

// EDHREC rank 15001. The draw is a delayed "whenever" watching the goaded
// creature this turn (Captain Howler's shape).

const TEXT =
  "{2}{U}: Goad target creature. Whenever that creature attacks one of your opponents this turn, you draw a card.";

export default defineCard({
  name: "Maeve, Insidious Singer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 3,
  toughness: 4,
  text: `${TEXT} (A goaded creature attacks each combat if able and attacks a player other than you if able, until your next turn.)`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "attacks", who: "self", filter: { attackingOpponent: true } },
              watching: 0,
            },
            effect: { kind: "draw", amount: 1 },
            text: "Whenever that creature attacks one of your opponents this turn, you draw a card.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
