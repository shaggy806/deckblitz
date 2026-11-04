import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 1635.
//
// "Blocking or blocked by a Goblin or Orc" reads the creatures in combat with
// the equipped creature, whoever controls them: a board condition with its
// `blockingRelation` read against the Equipment's host. A Goblin that leaves or
// is removed from combat is out of the relation, and the first strike goes.
const BOOST_TEXT = "Equipped creature gets +1/+1 and has haste.";
const UNTAP_TEXT = "At the beginning of each combat, untap equipped creature.";
const STRIKE_TEXT = "Equipped creature has first strike as long as it's blocking or blocked by a Goblin or Orc.";

export default defineCard({
  name: "Sting, the Glinting Dagger",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  supertypes: ["legendary"],
  subtypes: ["Equipment"],
  text: `${BOOST_TEXT}\n${UNTAP_TEXT}\n${STRIKE_TEXT}\nEquip {2}`,
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], grantKeywords: ["haste"], text: BOOST_TEXT },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "controls",
        filter: {
          type: "creature",
          subtypes: ["Goblin", "Orc"],
          blockingRelation: { relation: "either", of: "host" },
        },
        atLeast: 1,
        anyController: true,
      },
      grantKeywords: ["first-strike"],
      text: STRIKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
