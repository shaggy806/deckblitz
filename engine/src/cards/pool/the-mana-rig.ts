import { defineCard } from "../define.js";

// Rulings:
//   [2022-09-09] Although all the cards in the Dominaria United set that create Powerstone tokens
//     create a tapped Powerstone token, entering the battlefield tapped isn’t part of the token’s
//     definition. Notably, if you create a token that is a copy of a Powerstone token, the token
//     copy won’t enter the battlefield tapped.

export default defineCard({
  name: "The Mana Rig",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "Whenever you cast a multicolored spell, create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")\n{X}{X}{X}, {T}: Look at the top X cards of your library. Put up to two of them into your hand and the rest on the bottom of your library in a random order.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: "Whenever you cast a multicolored spell, create a tapped Powerstone token.",
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{X}{X}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        min: 0,
        max: 2,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "{X}{X}{X}, {T}: Look at the top X cards of your library. Put up to two of them into your hand and the rest on the bottom of your library in a random order.",
    },
  ],
});
