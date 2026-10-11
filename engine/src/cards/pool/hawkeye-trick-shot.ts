import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 14819. Marvel Super Heroes Commander.
//
// "Hawkeye or another Hero you control" is two triggers (`thisOrAnother`):
// Hawkeye's own entry fires whatever its types are by then. The entering
// creature deals the damage (`from: "trigger-object"`, Be'lakor's shape —
// its lifelink, deathtouch and colours apply), and the Heroes are counted as
// the trigger resolves.
const TEXT =
  "Whenever Hawkeye or another Hero you control enters, it deals damage equal to the number of Heroes you control to any target.";

export default defineCard({
  name: "Hawkeye, Trick Shot",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["reach", "first-strike"],
  text: `Reach, first strike\n${TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Hero" } },
      targets: ["any-target"],
      effect: {
        kind: "damage",
        amount: { countOf: { subtype: "Hero", controlledBy: "you" } },
        target: 0,
        from: "trigger-object",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
