import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 15171.

const TEXT =
  "When this creature enters, you may pay {X}. If you do, search your library for an Equipment card with mana value X or less, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Taj-Nar Swordsmith",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to search your library for an Equipment card with mana value X or less?",
        cost: "{X}",
        effect: {
          kind: "search-library",
          filter: { subtype: "Equipment", manaValue: { op: "lte", n: "x" } },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
