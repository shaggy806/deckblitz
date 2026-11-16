import { defineCard } from "../define.js";

// Back face of Chandra, Fire of Kaladesh. The −7's emblem goes to each player
// the damage was actually dealt to (`players-dealt-damage-this-way`): none to
// a player whose damage was all prevented, and one to Chandra's controller if
// some was redirected to them (its rulings). Each such player owns their
// emblem, and its damage is from a colorless source, the emblem.
//
// Rulings:
//   [2015-06-22] Each player who gets Chandra's emblem is the owner of that emblem. In multiplayer
//     games, that emblem will remain in the game as long as its owner does, even if Chandra's
//     owner leaves the game.
//   [2015-06-22] Only players actually dealt damage by the third ability of Chandra, Roaring
//     Flame will get an emblem. If all of that damage to a player is prevented, that player won't
//     get an emblem. If any of that damage is redirected to Chandra's controller, that player
//     will get an emblem.
//   [2015-06-22] The emblem created by Chandra, Roaring Flame is colorless. The damage it deals
//     is from a colorless source.

const PLUS = "+1: Chandra deals 2 damage to target player or planeswalker.";
const MINUS = "−2: Chandra deals 2 damage to target creature.";
const EMBLEM = "At the beginning of your upkeep, this emblem deals 3 damage to you.";
const ULT = `−7: Chandra deals 6 damage to each opponent. Each player dealt damage this way gets an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Chandra, Roaring Flame",
  art: "https://cards.scryfall.io/art_crop/back/b/0/b0d6caf0-4fa8-4ec5-b7f4-1307474d1b13.jpg",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 6, who: "each-opponent" },
          {
            kind: "for-each-player",
            who: "players-dealt-damage-this-way",
            effect: {
              kind: "as-player",
              who: "that-player",
              effect: {
                kind: "create-emblem",
                text: EMBLEM,
                triggered: [
                  {
                    trigger: { on: "step-begins", step: "upkeep", who: "you" },
                    targets: [],
                    effect: { kind: "damage", amount: 3, who: "you" },
                    resolve: null,
                    text: EMBLEM,
                  },
                ],
              },
            },
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
  faces: ["Chandra, Fire of Kaladesh", "Chandra, Roaring Flame"],
  transform: true,
});
