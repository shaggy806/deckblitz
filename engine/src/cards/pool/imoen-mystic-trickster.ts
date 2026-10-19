import { defineCard } from "../define.js";

// EDHREC rank 10151.

export default defineCard({
  name: "Imoen, Mystic Trickster",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Wizard"],
  power: 2,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nAt the beginning of your end step, if you have the initiative, draw a card. Draw another card if you've completed a dungeon.\nChoose a Background (You can have a Background as a second commander.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "conditional", condition: { kind: "completed-dungeon" }, then: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "At the beginning of your end step, if you have the initiative, draw a card. Draw another card if you've completed a dungeon.",
      condition: { kind: "initiative", who: "you" },
    },
  ],
});
