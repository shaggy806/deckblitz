import { defineCard } from "../define.js";

// EDHREC rank 5337.
// Rulings:
//   A card put into a hand without the word "draw" isn't a card drawn.
//   Devils you control that attack a planeswalker won't cause any player to
//   draw or discard a card: the batch counts only Devils attacking a player
//   (`attackingPlayer`), and "those players" are the ones they were declared
//   attacking (`"you-and-attacked-players"`).

const DRAW_TEXT =
  'Whenever an opponent draws their first card each turn, if it\'s not their turn, you create a 1/1 red Devil creature token with "When this token dies, it deals 1 damage to any target."';
const ATTACK_TEXT =
  "Whenever one or more Devils you control attack one or more players, you and those players each draw a card, then discard a card at random.";

export default defineCard({
  name: "Zurzoth, Chaos Rider",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 2,
  toughness: 3,
  text: `${DRAW_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "opponent", nthEachTurn: 1 },
      condition: { kind: "of-player", player: "that-player", condition: { kind: "not", of: { kind: "your-turn" } } },
      targets: [],
      effect: { kind: "create-token", token: "Devil Token", count: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Devil", attackingPlayer: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", who: "you-and-attacked-players", amount: 1 },
          { kind: "discard", target: "you-and-attacked-players", amount: 1, random: true },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
