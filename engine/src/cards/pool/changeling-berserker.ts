import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 13775.
//
// Champion a creature (rule 702.72): the `champion` helper's two linked triggers.

export default defineCard({
  name: "Changeling Berserker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 5,
  toughness: 3,
  keywords: ["changeling", "haste"],
  text: "Changeling (This card is every creature type.)\nHaste\nChampion a creature (When this enters, sacrifice it unless you exile another creature you control. When this leaves the battlefield, that card returns to the battlefield.)",
  triggered: champion({ type: "creature" }, "a creature"),
});
