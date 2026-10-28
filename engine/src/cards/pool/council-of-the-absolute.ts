import { defineCard } from "../define.js";

const NAME = "As this creature enters, choose a noncreature, nonland card name.";
const LOCK = "Your opponents can't cast spells with the chosen name.";
const DISCOUNT = "Spells with the chosen name you cast cost {2} less to cast.";

// Rulings (2013-04-15): one half of a split card only; the discount reduces
// only generic mana, after additional costs.

export default defineCard({
  name: "Council of the Absolute",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 4,
  chooseCardNameOnEnter: { filter: { notTypes: ["creature", "land"] } },
  text: `${NAME}\n${LOCK}\n${DISCOUNT}`,
  static: [
    { affects: { scope: "self" }, prohibits: { who: "opponents", spells: { chosenName: true } }, text: LOCK },
    {
      affects: { scope: "self" },
      costModification: { applies: { chosenName: true }, caster: "you", reduceGeneric: 2 },
      text: DISCOUNT,
    },
  ],
});
