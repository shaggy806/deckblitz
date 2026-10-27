import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 28229.

const ETB = "When this creature enters, look at the top four cards of your library, then put them back in any order.";

export default defineCard({
  name: "Sage Aven",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 4, min: 4, max: 4, destination: "library-top", leftover: "stay" },
      resolve: null,
      text: ETB,
    },
  ],
});
