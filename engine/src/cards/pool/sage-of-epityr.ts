import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 17599. Inkfathom Divers' trigger.

const TEXT = "When this creature enters, look at the top four cards of your library, then put them back in any order.";

export default defineCard({
  name: "Sage of Epityr",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 4, min: 4, max: 4, destination: "library-top", leftover: "stay" },
      resolve: null,
      text: TEXT,
    },
  ],
});
