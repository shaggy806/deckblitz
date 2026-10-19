import { defineCard } from "../define.js";

// EDHREC rank 10762.
//
// "X mana of any one color" is `"any-color"` with an amount above 1 (Gilded
// Lotus, The Eternity Elevator): all of it one colour. X is Crypt of
// Agadeem's count of creature cards in your graveyard, read as the ability
// resolves (or as the auto-payer sizes it).

const TEXT = "{T}: Add X mana of any one color, where X is the number of creature cards in your graveyard.";

export default defineCard({
  name: "Deathbloom Ritualist",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Warlock"],
  power: 3,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
