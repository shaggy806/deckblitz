import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 19547. Sage Owl's ability.

const TEXT =
  "When this creature enters, look at the top four cards of your library, then put them back in any order.";

export default defineCard({
  name: "Spire Owl",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 4,
        max: 4,
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
