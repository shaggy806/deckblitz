import { defineCard } from "../define.js";

// EDHREC rank 26989.
//
// Activated from the graveyard; the cost doesn't exile the card
// (`staysInZone` — Abzan Devotee's shape, with Tortured Existence's discard).
const TEXT = "{2}{B}, Discard a creature card: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Kraul Swarm",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Warrior"],
  power: 4,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, discard: { count: 1, filter: { type: "creature" } } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
