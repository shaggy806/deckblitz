import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, if 4 or more damage was dealt to it this turn, this creature deals 3 damage to any target.";

export default defineCard({
  name: "Burning-Eye Zubera",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zubera", "Spirit"],
  power: 3,
  toughness: 3,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "damage-dealt-this-turn", who: "any-player", toSelf: true, atLeast: 4 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
