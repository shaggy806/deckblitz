import { defineCard } from "../define.js";

// EDHREC rank 15930.


const ROBOT_TEXT =
  "When this artifact enters or leaves the battlefield, create a 1/1 colorless Robot artifact creature token.";
const DAMAGE_TEXT = "{4}{R}, Sacrifice this artifact: It deals 3 damage to target creature.";

// "Enters or leaves" is one ability on two events (Sewer-veillance Cam's
// shape: a trigger for each); "it deals" is the sacrificed artifact, as it
// last existed (Sunset Strikemaster).
export default defineCard({
  name: "Mouser Foundry",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${ROBOT_TEXT}\n${DAMAGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{R}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 3 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Big Mother Mouser)", count: 1 },
      resolve: null,
      text: ROBOT_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Big Mother Mouser)", count: 1 },
      resolve: null,
      text: ROBOT_TEXT,
    },
  ],
});
