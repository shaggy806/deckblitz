import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add an amount of {C} equal to Vhal's toughness. This mana can't be spent to cast spells from your hand.";

export default defineCard({
  name: "Vhal, Candlekeep Researcher",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  pairing: { kind: "choose-a-background" },
  text: `Vigilance\n${MANA_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { toughnessOf: "source" },
        spendOnly: { notCastFrom: ["hand"], text: "This mana can't be spent to cast spells from your hand." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
