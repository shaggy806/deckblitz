import { defineCard } from "../define.js";

// EDHREC rank 19269.

export default defineCard({
  name: "Jenny, Generated Anomaly",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["double-strike"],
  text: "Double strike\nWhenever Jenny deals combat damage to a player, it explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: "Whenever Jenny deals combat damage to a player, it explores.",
    },
  ],
});
