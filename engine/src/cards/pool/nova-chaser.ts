import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 20066.
//
// Champion an Elemental (rule 702.72): the `champion` helper's two linked
// triggers; a changeling counts as an Elemental (rule 702.73a).

export default defineCard({
  name: "Nova Chaser",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 10,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nChampion an Elemental (When this enters, sacrifice it unless you exile another Elemental you control. When this leaves the battlefield, that card returns to the battlefield.)",
  triggered: champion({ subtype: "Elemental" }, "an Elemental"),
});
