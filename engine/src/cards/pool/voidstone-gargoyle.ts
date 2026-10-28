import { defineCard } from "../define.js";

// EDHREC rank 27817.

export default defineCard({
  name: "Voidstone Gargoyle",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] }, aim: "opponent-permanents" },
  text: "Flying\nAs this creature enters, choose a nonland card name.\nSpells with the chosen name can't be cast.\nActivated abilities of sources with the chosen name can't be activated.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", spells: { chosenName: true } },
      text: "Spells with the chosen name can't be cast.",
    },
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", abilitiesOf: { chosenName: true }, anyZone: true },
      text: "Activated abilities of sources with the chosen name can't be activated.",
    },
  ],
});
