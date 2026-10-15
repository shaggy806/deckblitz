import { defineCard } from "../define.js";

// Exdeath, Void Warlock's back face.

const POWER_TEXT = "Neo Exdeath's power is equal to the number of permanent cards in your graveyard.";

export default defineCard({
  name: "Neo Exdeath, Dimension's End",
  art: "https://cards.scryfall.io/art_crop/back/1/b/1b4bab87-4000-461d-8b58-d34928fee305.jpg",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 0,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${POWER_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (Uurg, Spawn of Turg's shape) over
      // the permanent cards — not instants or sorceries — in its
      // controller's graveyard.
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { notTypes: ["instant", "sorcery"], ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  faces: ["Exdeath, Void Warlock", "Neo Exdeath, Dimension's End"],
  transform: true,
});
