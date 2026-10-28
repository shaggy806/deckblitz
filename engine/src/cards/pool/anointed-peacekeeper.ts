import { defineCard } from "../define.js";

const NAME = "As this creature enters, look at an opponent's hand, then choose any card name.";
const SPELL_TAX = "Spells your opponents cast with the chosen name cost {2} more to cast.";
const ABILITY_TAX =
  "Activated abilities of sources with the chosen name cost {2} more to activate unless they're mana abilities.";

// Rulings (2022-09-09): any card name, not only one seen; the ability tax
// reaches cards in every zone; the spell tax reaches every opponent.

export default defineCard({
  name: "Anointed Peacekeeper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${NAME}\n${SPELL_TAX}\n${ABILITY_TAX}`,
  chooseCardNameOnEnter: { look: "opponent-hand" },
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { chosenName: true }, caster: "opponent", increaseGeneric: 2 },
      text: SPELL_TAX,
    },
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { chosenName: true }, increaseGeneric: 2, anyZone: true, exceptManaAbilities: true },
      text: ABILITY_TAX,
    },
  ],
});
