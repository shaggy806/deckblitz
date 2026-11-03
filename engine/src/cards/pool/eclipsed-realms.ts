import { defineCard } from "../define.js";

// The chosen word is a creature type read as any subtype: "a spell of the chosen
// type" takes a Kindred spell too, and "a source" a card's ability in any zone
// (rule 109.2a), as Secluded Courtyard's does.
const CHOOSE_TEXT = "As this land enters, choose Elemental, Elf, Faerie, Giant, Goblin, Kithkin, Merfolk, or Treefolk.";
const SPEND_TEXT =
  "Spend this mana only to cast a spell of the chosen type or activate an ability of a source of the chosen type.";

export default defineCard({
  name: "Eclipsed Realms",
  colors: [],
  types: ["land"],
  text: `${CHOOSE_TEXT}\n{T}: Add {C}.\n{T}: Add one mana of any color. ${SPEND_TEXT}`,
  chooseCreatureTypeOnEnter: true,
  chooseCreatureTypeMenu: ["Elemental", "Elf", "Faerie", "Giant", "Goblin", "Kithkin", "Merfolk", "Treefolk"],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: { spell: {}, abilityOf: {}, abilityOfAnyZone: true, chosenType: true, text: SPEND_TEXT },
      },
      resolve: null,
      text: `{T}: Add one mana of any color. ${SPEND_TEXT}`,
    },
  ],
});
