import { defineCard } from "../define.js";

export default defineCard({
  name: "Doc Aurlock, Grizzled Genius",
  art: "https://scryfall.com/card/otj/201",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bear", "Druid"],
  power: 2,
  toughness: 3,
  text: "Spells you cast from your graveyard or from exile cost {2} less to cast.\nPlotting cards from your hand costs {2} less.",
  static: [
    {
      // Generic mana only, and neither the spell's mana cost nor its mana
      // value changes (the rulings).
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", castFrom: ["graveyard", "exile"], reduceGeneric: 2 },
      text: "Spells you cast from your graveyard or from exile cost {2} less to cast.",
    },
    {
      // The plot special action's cost (rule 702.170a), generic mana only.
      affects: { scope: "self" },
      plotCostReduction: 2,
      text: "Plotting cards from your hand costs {2} less.",
    },
  ],
});
