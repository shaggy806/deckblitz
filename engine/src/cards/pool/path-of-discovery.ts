import { defineCard } from "../define.js";

export default defineCard({
  name: "Path of Discovery",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a creature you control enters, it explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on the creature, then put the card back or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "explore", target: "trigger-object" },
      resolve: null,
      text: "Whenever a creature you control enters, it explores.",
    },
  ],
});
