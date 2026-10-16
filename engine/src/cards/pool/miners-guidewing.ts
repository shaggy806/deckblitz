import { defineCard } from "../define.js";

export default defineCard({
  name: "Miner's Guidewing",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nWhen this creature dies, target creature you control explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "explore", target: 0 },
      resolve: null,
      text: "When this creature dies, target creature you control explores.",
    },
  ],
});
