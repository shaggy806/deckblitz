import { defineCard } from "../define.js";

// EDHREC rank 5533. Pithing Needle's lock without its exception: mana
// abilities can't be activated either.

const NAME = "As this creature enters, choose a nonland card name.";
const LOCK = "Activated abilities of sources with the chosen name can't be activated.";

export default defineCard({
  name: "Phyrexian Revoker",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 2,
  toughness: 1,
  text: `${NAME}\n${LOCK}`,
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] }, aim: "opponent-permanents" },
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", abilitiesOf: { chosenName: true }, anyZone: true },
      text: LOCK,
    },
  ],
});
