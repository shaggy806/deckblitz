import { defineCard } from "../define.js";

// EDHREC rank 18730. Only a nonland card revealed may be named; with none,
// no name is chosen and nothing is stopped.

const NAME =
  "As Alhammarret enters, each opponent reveals their hand. You choose the name of a nonland card revealed this way.";
const LOCK = "Your opponents can't cast spells with the chosen name (as long as this creature is on the battlefield).";

export default defineCard({
  name: "Alhammarret, High Arbiter",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${NAME}\n${LOCK}`,
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] }, reveal: "each-opponent-hand" },
  static: [{ affects: { scope: "self" }, prohibits: { who: "opponents", spells: { chosenName: true } }, text: LOCK }],
});
