import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19944.

export default defineCard({
  name: "Thoughtweft Trio",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["first-strike", "vigilance"],
  text: "First strike, vigilance\nChampion a Kithkin (When this enters, sacrifice it unless you exile another Kithkin you control. When this leaves the battlefield, that card returns to the battlefield.)\nThis creature can block any number of creatures.",
  triggered: champion({ subtype: "Kithkin" }, "a Kithkin"),
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: "any",
      text: "This creature can block any number of creatures.",
    },
  ],
});
