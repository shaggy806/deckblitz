import { defineCard } from "../define.js";

// EDHREC rank 27806.

export default defineCard({
  name: "Queen's Agent",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: "Lifelink\nWhen this creature enters, it explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
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
