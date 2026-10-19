import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, choose one —\n• Create a 1/1 green and white Citizen creature token.\n• Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";

export default defineCard({
  name: "Exhibition Magician",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Create a 1/1 green and white Citizen creature token.", effect: { kind: "create-token", token: "Citizen Token", count: 1 } },
          { text: "Create a Treasure token.", effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
