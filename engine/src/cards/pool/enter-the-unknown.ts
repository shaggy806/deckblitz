import { defineCard } from "../define.js";

// EDHREC rank 8580. An illegal target stops the whole spell, the extra land
// drop with it (its ruling): the ordinary rule 608.2b fizzle.

export default defineCard({
  name: "Enter the Unknown",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on the creature, then put the card back or put it into your graveyard.)\nYou may play an additional land this turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "explore", target: 0 },
      { kind: "additional-land-drop", amount: 1 },
    ],
  },
});
