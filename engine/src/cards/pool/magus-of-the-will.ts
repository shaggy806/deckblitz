import { defineCard } from "../define.js";

// Rulings:
//   It doesn't change when you can play the cards in your graveyard.
//   Cards that would be put into your graveyard are exiled even if you didn't play them this turn,
//   such as a nontoken creature that would die. Tokens go to your graveyard as normal.
const TEXT =
  "{2}{B}, {T}, Exile this creature: Until end of turn, you may play lands and cast spells from your graveyard. If a card would be put into your graveyard from anywhere this turn, exile that card instead.";

export default defineCard({
  name: "Magus of the Will",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "graveyard", play: true } },
          { kind: "replacement-effect", duration: "end-of-turn", replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you", token: false } } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
