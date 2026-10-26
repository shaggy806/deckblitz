import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 15680.
//
// Champion a creature (rule 702.72): the `champion` helper's two linked triggers.

export default defineCard({
  name: "Changeling Titan",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 7,
  toughness: 7,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nChampion a creature (When this enters, sacrifice it unless you exile another creature you control. When this leaves the battlefield, that card returns to the battlefield.)",
  triggered: champion({ type: "creature" }, "a creature"),
});
