import { defineCard } from "../define.js";

export default defineCard({
  name: "Pathfinding Axejaw",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 3,
  text: "When this creature enters, it explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: "When this creature enters, it explores.",
    },
  ],
});
