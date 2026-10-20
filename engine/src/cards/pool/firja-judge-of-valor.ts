import { defineCard } from "../define.js";

// EDHREC rank 7821.
//
// `nthEachTurn: 2` counts every spell its controller cast this turn, those
// cast before Firja entered included, so it triggers at most once a turn and
// never for Firja herself being the second (the rulings).
const TEXT =
  "Whenever you cast your second spell each turn, look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Firja, Judge of Valor",
  manaCost: "{2}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Cleric"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
