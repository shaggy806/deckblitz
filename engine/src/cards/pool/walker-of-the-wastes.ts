import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+1 for each land you control named Wastes.";

export default defineCard({
  name: "Walker of the Wastes",
  manaCost: "{4}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `({C} represents colorless mana.)\nTrample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "land", controlledBy: "you", name: "Wastes" }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
