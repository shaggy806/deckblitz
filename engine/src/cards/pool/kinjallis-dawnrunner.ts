import { defineCard } from "../define.js";

export default defineCard({
  name: "Kinjalli's Dawnrunner",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike\nWhen this creature enters, it explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
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
