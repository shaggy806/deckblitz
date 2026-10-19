import { defineCard } from "../define.js";

// EDHREC rank 10960.

export default defineCard({
  name: "Safana, Calimport Cutthroat",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  pairing: { kind: "choose-a-background" },
  text: "Menace\nAt the beginning of your end step, if you have the initiative, create a Treasure token. Create three of those tokens instead if you've completed a dungeon.\nChoose a Background (You can have a Background as a second commander.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { ifCondition: { kind: "completed-dungeon" }, then: 3, else: 1 },
      },
      resolve: null,
      text: "At the beginning of your end step, if you have the initiative, create a Treasure token. Create three of those tokens instead if you've completed a dungeon.",
      condition: { kind: "initiative", who: "you" },
    },
  ],
});
