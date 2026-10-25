import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 27403. Flood's tap ability.

export default defineCard({
  name: "Merfolk Seastalkers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["islandwalk"],
  text: "Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n{2}{U}: Tap target creature without flying.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{2}{U}: Tap target creature without flying.",
    },
  ],
});
