import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// Morningtide. Champion (rule 702.72): the `champion` helper.

export default defineCard({
  name: "Supreme Exemplar",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 10,
  toughness: 10,
  keywords: ["flying"],
  text: "Flying\nChampion an Elemental (When this enters, sacrifice it unless you exile another Elemental you control. When this leaves the battlefield, that card returns to the battlefield.)",
  triggered: champion({ subtype: "Elemental" }, "an Elemental"),
});
