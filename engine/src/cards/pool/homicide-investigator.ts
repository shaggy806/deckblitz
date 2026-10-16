import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const TEXT =
  "Whenever one or more nontoken creatures you control die, investigate. This ability triggers only once each turn. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Homicide Investigator",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      // Once each turn, so "one or more" dying together investigates once;
      // its own death counts (the rulings).
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false } },
      oncePerTurn: true,
      targets: [],
      effect: investigate(),
      resolve: null,
      text: TEXT,
    },
  ],
});
