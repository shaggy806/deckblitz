import { defineCard } from "../define.js";

// EDHREC rank 32048.
const TEXT = "Whenever this creature attacks alone, it gets +3/+0 until end of turn.";

export default defineCard({
  name: "Reckless Ogre",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
