import { defineCard } from "../define.js";

const TEXT = "Nonland cards in your hand have miracle {0}.";

export default defineCard({
  name: "Molecule Man",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 5,
  toughness: 5,
  text: `${TEXT} (You may cast a card for its miracle cost when you draw it if it's the first card you drew this turn.)`,
  static: [
    {
      affects: { scope: "self" },
      grantsToHand: { filter: { notTypes: ["land"] }, keywordValues: [{ keyword: "miracle", cost: "{0}" }] },
      text: TEXT,
    },
  ],
});
