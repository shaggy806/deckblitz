import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const CAST_TEXT = "Whenever you cast a Doctor spell or creature spell with doctor's companion, draw a card.";

export default defineCard({
  name: "Rose Noble",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  pairing: { kind: "doctors-companion" },
  text: `Ward {2}\n${CAST_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      // Doctor's companion read off the spell's text box (rule 702.124m).
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ subtype: "Doctor" }, { type: "creature", hasKeyword: "doctors-companion" }] },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
