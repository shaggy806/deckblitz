import { defineCard } from "../define.js";

// The Sea Devils' 2/2 green Alien Salamander with islandwalk.

export default defineCard({
  name: "Alien Salamander Token",
  art: "248f247c-edb7-438a-b004-be3d4fcd3d3f",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Alien", "Salamander"],
  power: 2,
  toughness: 2,
  keywords: ["islandwalk"],
  text: "Islandwalk (This creature can't be blocked as long as defending player controls an Island.)",
});
