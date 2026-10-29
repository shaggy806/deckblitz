import { defineCard } from "../define.js";

// The back face of The Legend of Yangchen (colorless — no color indicator).
// Airbend (rule 701.65a) is an `exile` with `airbend` (Aang, the Last
// Airbender's shape); "your second spell each turn" is Jori En's trigger.
const TEXT =
  "Whenever you cast your second spell each turn, airbend up to one other target nonland permanent.";

export default defineCard({
  name: "Avatar Yangchen",
  art: "https://cards.scryfall.io/art_crop/back/a/6/a60e8f23-90b2-4bc6-bd54-a95055556389.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "exile", target: 0, airbend: true },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["The Legend of Yangchen", "Avatar Yangchen"],
  transform: true,
});
