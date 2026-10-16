import { defineCard } from "../define.js";

const TEXT = "{1}, {T}, Sacrifice this artifact: Target creature you control explores. Activate only as a sorcery.";

// Rule 111.10s: the predefined Map. The explorer is a target (a creature you
// control), so a Map can't be cracked with no creature to explore.
export default defineCard({
  name: "Map Token",
  art: "64839118-09d2-4645-9d3c-f80755ac781f",
  types: ["artifact"],
  subtypes: ["Map"],
  text: `${TEXT} (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      sorcerySpeed: true,
      targets: ["creature-you-control"],
      effect: { kind: "explore", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
