import { defineCard } from "../define.js";

// Miner's Guidewing's targeted explore, at sorcery speed.
export default defineCard({
  name: "Guidestone Compass",
  art: "https://cards.scryfall.io/art_crop/back/d/e/dedd7a22-92e2-41fd-aa80-944c69653a5e.jpg",
  colors: ["U"],
  types: ["artifact"],
  text: "{1}, {T}: Target creature you control explores. Activate only as a sorcery. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "explore", target: 0 },
      resolve: null,
      text: "{1}, {T}: Target creature you control explores. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Lodestone Needle", "Guidestone Compass"],
  transform: true,
});
