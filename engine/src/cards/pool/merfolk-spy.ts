import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals combat damage to a player, that player reveals a card at random from their hand.";

export default defineCard({
  name: "Merfolk Spy",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "choose-random-card", zone: "hand", whose: "that-player", show: "reveal" },
      resolve: null,
      text: TEXT,
    },
  ],
});
