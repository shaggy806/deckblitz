import { defineCard } from "../define.js";

// EDHREC rank 18014.

const NAME = "As this creature enters, choose a nonland card name.";
const LOCK = "Spells with the chosen name can't be cast.";

export default defineCard({
  name: "Meddling Mage",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${NAME}\n${LOCK}`,
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] } },
  static: [{ affects: { scope: "self" }, prohibits: { who: "each-player", spells: { chosenName: true } }, text: LOCK }],
});
