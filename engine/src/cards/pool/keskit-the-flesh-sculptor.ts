import { defineCard } from "../define.js";

// EDHREC rank 13968.
//
// Mondrak, Glory Dominus's "Sacrifice two other artifacts and/or creatures"
// cost at three, then Sibsig Appraiser's look at three.

const TEXT =
  "{T}, Sacrifice three other artifacts and/or creatures: Look at the top three cards of your library. Put two of them into your hand and the other into your graveyard.";

export default defineCard({
  name: "Keskit, the Flesh Sculptor",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Artificer"],
  power: 1,
  toughness: 3,
  pairing: { kind: "partner" },
  text: `${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] }, count: 3 } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 2,
        max: 2,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
