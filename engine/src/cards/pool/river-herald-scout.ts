import { defineCard } from "../define.js";

export default defineCard({
  name: "River Herald Scout",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 1,
  toughness: 2,
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
