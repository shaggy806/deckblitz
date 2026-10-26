import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 17364.
//
// Champion a creature (rule 702.72): the `champion` helper's two linked triggers.

export default defineCard({
  name: "Changeling Hero",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 4,
  keywords: ["changeling", "lifelink"],
  text: "Changeling (This card is every creature type.)\nChampion a creature (When this enters, sacrifice it unless you exile another creature you control. When this leaves the battlefield, that card returns to the battlefield.)\nLifelink (Damage dealt by this creature also causes you to gain that much life.)",
  triggered: champion({ type: "creature" }, "a creature"),
});
