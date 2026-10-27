import { defineCard } from "../define.js";

// Torment. EDHREC rank 24826.

const TEXT = "{3}{W}{W}, Sacrifice Major Teroh: Exile all black creatures.";

export default defineCard({
  name: "Major Teroh",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { type: "creature", colors: ["B"] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
