import { defineCard } from "../define.js";

// EDHREC rank 15434.
//
// X is Firebird's power as the trigger resolves (as it last existed on the
// battlefield, if it has left), fixed from then on; the creatures are the
// ones attacking then (rule 611.2c).

const ATTACK_TEXT =
  "Whenever Firebird attacks, other attacking creatures get +X/+0 until end of turn, where X is Firebird's power.";

export default defineCard({
  name: "Firebird, Blazing Ranger",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ranger", "Hero"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: { powerOf: "source" },
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
