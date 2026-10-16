import { defineCard } from "../define.js";

export default defineCard({
  name: "Green Goblin",
  art: "https://cards.scryfall.io/art_crop/back/d/5/d5c53af9-7150-4e78-8771-2de7980aa307.jpg",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Human", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "menace"],
  text: "Flying, menace\nSpells you cast from your graveyard cost {2} less to cast.\nGoblin Formula — Each nonland card in your graveyard has mayhem. The mayhem cost is equal to its mana cost. (You may cast a card from your graveyard for its mayhem cost if you discarded it this turn. Timing rules still apply.)",
  faces: ["Norman Osborn", "Green Goblin"],
  static: [
    {
      // Generic mana only (the ruling); it allows no cast by itself.
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", castFrom: "graveyard", reduceGeneric: 2 },
      text: "Spells you cast from your graveyard cost {2} less to cast.",
    },
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { notTypes: ["land"] }, mayhem: { cost: "mana-cost" } },
      text: "Goblin Formula — Each nonland card in your graveyard has mayhem. The mayhem cost is equal to its mana cost.",
    },
  ],
});
