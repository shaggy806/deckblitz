import { defineCard } from "../define.js";

// EDHREC rank 23778.
const POWER_TEXT =
  "Dragon Man's power is equal to the greatest mana value among noncreature permanents you control and noncreature cards in your graveyard.";
const GRAVEYARD_TEXT = "You may cast this card from your graveyard by discarding a card in addition to paying its other costs.";

export default defineCard({
  name: "Dragon Man, Reformed Robot",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Dragon", "Robot"],
  power: 0,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${POWER_TEXT}\n${GRAVEYARD_TEXT}`,
  castSelfFromGraveyard: { discard: 1 },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          aggregate: "max",
          of: "mana-value",
          filter: { notTypes: ["creature"], controlledBy: "you" },
          plus: [{ filter: { notTypes: ["creature"], ownedBy: "you" }, in: "graveyards" }],
        },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
