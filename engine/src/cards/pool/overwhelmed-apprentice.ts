import { defineCard } from "../define.js";

const TEXT = "When this creature enters, each opponent mills two cards. Then you scry 2.";

export default defineCard({
  name: "Overwhelmed Apprentice",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: `${TEXT} (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // One scry after every opponent has milled (its ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-opponent", amount: 2 },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
