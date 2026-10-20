import { defineCard } from "../define.js";

// EDHREC rank 14649.
const PT_TEXT = "This creature gets +3/+2 as long as there are four or more creature cards in your graveyard.";

export default defineCard({
  name: "Reclusive Taxidermist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 2,
  text: `${PT_TEXT}\n{T}: Add one mana of any color.`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { type: "creature" } },
      grantPt: [3, 2],
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});
