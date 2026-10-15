import { defineCard } from "../define.js";

// Sidequest: Hunt the Mark's back face. Immersturm Predator's ability, with a
// mana cost and "creature or artifact".

const ABILITY_TEXT =
  "{1}{B}, Sacrifice another creature or artifact: Yiazmat gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Yiazmat, Ultimate Mark",
  art: "https://cards.scryfall.io/art_crop/back/c/3/c3eb2ae5-10de-4c3d-91c8-8734befc80b2.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 6,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: {
        mana: "{1}{B}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } },
      },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
  faces: ["Sidequest: Hunt the Mark", "Yiazmat, Ultimate Mark"],
  transform: true,
});
