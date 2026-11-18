import { defineCard } from "../define.js";

// Back face of Sunbird Standard. "The exiled cards used to craft it" are the
// cards linked to it (rule 702.167c), read while they stay exiled: each color
// among them once (at most five, its ruling), a colorless one none (105.2c),
// and a token used to craft leaves nothing to read (the ruling).
const PT_TEXT =
  "Sunbird Effigy's power and toughness are each equal to the number of colors among the exiled cards used to craft it.";
const MANA_TEXT = "{T}: For each color among the exiled cards used to craft this creature, add one mana of that color.";

export default defineCard({
  name: "Sunbird Effigy",
  art: "https://cards.scryfall.io/art_crop/back/e/0/e0b6d40a-fded-4625-b03c-765c88d75766.jpg",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Bird", "Construct"],
  power: 0,
  toughness: 0,
  keywords: ["flying", "vigilance", "haste"],
  text: `Flying, vigilance, haste\n${PT_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "distinct", of: "color", filter: {}, in: "exiled-with-source" },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { eachColorAmong: {}, zone: "exiled-with-source" }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  faces: ["Sunbird Standard", "Sunbird Effigy"],
  transform: true,
});
