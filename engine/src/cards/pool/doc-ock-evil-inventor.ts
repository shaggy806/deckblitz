import { defineCard } from "../define.js";

// EDHREC rank 17981. The change has no duration: the artifact stays an 8/8
// Robot Villain artifact creature for as long as it's on the battlefield.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, target noncreature artifact you control becomes an 8/8 Robot Villain artifact creature in addition to its other types.";

export default defineCard({
  name: "Doc Ock, Evil Inventor",
  manaCost: "{5}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 8,
  toughness: 8,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "become",
        target: 0,
        power: 8,
        toughness: 8,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Robot", "Villain"],
        duration: "permanent",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
