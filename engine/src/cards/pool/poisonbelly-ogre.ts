import { defineCard } from "../define.js";

// EDHREC rank 28296.
//
// Rulings:
//   [2006-02-01] The controller of the creature that entered loses the life. This may or may not
//     be the same player as Poisonbelly Ogre's controller.
const TEXT = "Whenever another creature enters, its controller loses 1 life.";

export default defineCard({
  name: "Poisonbelly Ogre",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
