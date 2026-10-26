import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, it deals damage equal to the number of Giants you control to each non-Giant creature.";

export default defineCard({
  name: "Thundercloud Shaman",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Shaman"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", notSubtypes: ["Giant"] },
        amount: { countOf: { subtype: "Giant", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
