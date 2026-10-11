import { defineCard } from "../define.js";

// EDHREC rank 17217. Marvel Super Heroes Commander.
//
// No duration (rule 611.2a): the change lasts as long as that permanent
// stays on the battlefield (`"permanent"`). Artifact and creature added in
// layer 4, flying in 6, base 5/5 in 7b; counters and pumps still apply on
// top. Its other types and abilities stay.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, target artifact or creature becomes an artifact creature with base power and toughness 5/5 and gains flying.";

export default defineCard({
  name: "Iron Man, Futurist Paragon",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        keywords: ["flying"],
        duration: "permanent",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
