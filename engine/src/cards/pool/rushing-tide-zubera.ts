import { defineCard } from "../define.js";

const DIES_TEXT = "When this creature dies, if 4 or more damage was dealt to it this turn, draw three cards.";

export default defineCard({
  name: "Rushing-Tide Zubera",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zubera", "Spirit"],
  power: 3,
  toughness: 3,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "damage-dealt-this-turn", who: "any-player", toSelf: true, atLeast: 4 },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
