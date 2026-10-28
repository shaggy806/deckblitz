import { defineCard } from "../define.js";

// Any two lands with the subtype Island (the ruling).
const TEXT = "Sacrifice two Islands: This creature can't be blocked this turn.";

export default defineCard({
  name: "Biolume Serpent",
  art: "https://cards.scryfall.io/art_crop/back/0/0/009c8a91-8c73-4e3f-9955-45344ae07832.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Island" }, count: 2 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Biolume Egg", "Biolume Serpent"],
  transform: true,
});
