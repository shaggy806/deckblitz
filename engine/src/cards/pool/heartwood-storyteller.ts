import { defineCard } from "../define.js";

const TRIGGER = "Whenever a player casts a noncreature spell, each of that player's opponents may draw a card.";

export default defineCard({
  name: "Heartwood Storyteller",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 2,
  toughness: 3,
  text: TRIGGER,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "opponents-of-trigger-controller",
        prompt: "Draw a card?",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
