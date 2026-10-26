import { defineCard } from "../define.js";

// Dissension.
export default defineCard({
  name: "Ogre Gatecrasher",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Rogue"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, destroy target creature with defender.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "defender" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target creature with defender.",
    },
  ],
});
