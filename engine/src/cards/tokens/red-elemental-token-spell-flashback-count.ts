import { defineCard } from "../define.js";

// Seize the Storm's token; its power and toughness are counted from the
// player who controls it.

const CDA =
  "This creature's power and toughness are each equal to the number of instant and sorcery cards in your graveyard plus the number of cards with flashback you own in exile.";

export default defineCard({
  name: "Red Elemental Token (Trample, Spells and Flashback Count)",
  tokenName: "Elemental",
  art: "0e99650f-a153-4a80-86d8-8fd2c3f19d85",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${CDA}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          aggregate: "count",
          filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
          in: "graveyards",
          plus: [{ filter: { hasKeyword: "flashback", ownedBy: "you" }, in: "exile" }],
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA,
    },
  ],
});
