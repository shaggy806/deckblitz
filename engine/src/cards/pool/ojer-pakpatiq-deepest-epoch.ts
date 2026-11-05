import { defineCard } from "../define.js";

// EDHREC rank 3320. A rebound spell countered never resolves, so it isn't
// exiled (the rulings).
const REBOUND_TEXT =
  "Whenever you cast an instant spell from your hand, it gains rebound. (Exile it as it resolves. At the beginning of your next upkeep, you may cast it from exile without paying its mana cost.)";
const DIES_TEXT =
  "When Ojer Pakpatiq dies, return it to the battlefield tapped and transformed under its owner's control with three time counters on it.";

export default defineCard({
  name: "Ojer Pakpatiq, Deepest Epoch",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${REBOUND_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { type: "instant" } },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "rebound", duration: "permanent" },
      resolve: null,
      text: REBOUND_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "source",
        enterTapped: true,
        transformed: true,
        withCounters: { kind: "time", amount: 3 },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Ojer Pakpatiq, Deepest Epoch", "Temple of Cyclical Time"],
  transform: true,
});
