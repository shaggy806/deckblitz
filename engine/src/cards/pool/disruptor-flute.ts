import { defineCard } from "../define.js";

// EDHREC rank 7336.

const NAME = "As this artifact enters, choose a card name.";
const TAX = "Spells with the chosen name cost {3} more to cast.";
const LOCK = "Activated abilities of sources with the chosen name can't be activated unless they're mana abilities.";

export default defineCard({
  name: "Disruptor Flute",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash\n${NAME}\n${TAX}\n${LOCK}`,
  chooseCardNameOnEnter: { aim: "opponent-permanents" },
  static: [
    { affects: { scope: "self" }, costModification: { applies: { chosenName: true }, increaseGeneric: 3 }, text: TAX },
    {
      affects: { scope: "self" },
      prohibits: {
        who: "each-player",
        abilitiesOf: { chosenName: true },
        anyZone: true,
        exceptManaAbilities: true,
      },
      text: LOCK,
    },
  ],
});
