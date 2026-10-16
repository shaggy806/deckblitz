import { defineCard } from "../define.js";

export default defineCard({
  name: "Jadelight Spelunker",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, it explores X times. (To have it explore, reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "explore", target: "source", times: "x" },
      resolve: null,
      text: "When this creature enters, it explores X times.",
    },
  ],
});
