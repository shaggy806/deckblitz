import { defineCard } from "../define.js";

export default defineCard({
  name: "River Herald Guide",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 3,
  toughness: 1,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, it explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
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
