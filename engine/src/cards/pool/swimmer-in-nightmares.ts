import { defineCard } from "../define.js";

// EDHREC rank 28903. "A single graveyard" is any one graveyard, yours
// included, each counted on its own.

export default defineCard({
  name: "Swimmer in Nightmares",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Merfolk"],
  power: 1,
  toughness: 4,
  text: "This creature gets +3/+0 as long as there are ten or more cards in a single graveyard.\nThis creature can't be blocked as long as you control an Ashiok planeswalker.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 10, whose: "any-player" },
      grantPt: [3, 0],
      text: "This creature gets +3/+0 as long as there are ten or more cards in a single graveyard.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Ashiok" }, atLeast: 1 },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked as long as you control an Ashiok planeswalker.",
    },
  ],
});
