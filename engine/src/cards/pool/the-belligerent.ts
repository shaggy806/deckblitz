import { defineCard } from "../define.js";

// EDHREC rank 7006.
//
// The attack trigger's permissions are a `player-effect` until end of turn:
// they last whatever becomes of the Vehicle.
//
// Rulings:
//   [2023-11-10] If the top card of your library has an Adventure, you can cast the Adventure
//     spell this way.
//   [2023-11-10] If the top card of your library changes while you're casting a spell, playing a
//     land, or activating an ability, you can't look at the new top card until you finish doing
//     so. This means that if you cast a spell from the top of your library, you can't look at the
//     next one until you're done paying for that spell.
//   [2023-11-10] You must pay all costs and follow all timing rules for spells cast and lands
//     played from the top of your library this way.
//   [2023-11-10] Once The Belligerent's triggered ability resolves, you can look at the top card
//     of your library whenever you want until end of turn (with one restriction; see below), even
//     if you don't have priority. This action doesn't use the stack. Knowing what that card is
//     becomes part of the information you have access to, just like you can look at the cards in
//     your hand.

export default defineCard({
  name: "The Belligerent",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: "Whenever The Belligerent attacks, create a Treasure token. Until end of turn, you may look at the top card of your library any time, and you may play lands and cast spells from the top of your library.\nCrew 3",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 3",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          {
            kind: "player-effect",
            duration: "end-of-turn",
            looksAtOwnLibraryTop: true,
            mayPlay: { from: "library-top", play: true },
          },
        ],
      },
      resolve: null,
      text: "Whenever The Belligerent attacks, create a Treasure token. Until end of turn, you may look at the top card of your library any time, and you may play lands and cast spells from the top of your library.",
    },
  ],
});
