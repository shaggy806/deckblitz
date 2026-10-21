import { defineCard } from "../define.js";

// EDHREC rank 13748.

export default defineCard({
  name: "Jadelight Ranger",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout", "Ranger"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, it explores, then it explores again. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard. Then repeat this process.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "explore", target: "source", times: 2 },
      resolve: null,
      text: "When this creature enters, it explores, then it explores again.",
    },
  ],
});
