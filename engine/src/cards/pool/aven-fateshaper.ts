import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 25002.

const LOOK = "look at the top four cards of your library, then put them back in any order.";

export default defineCard({
  name: "Aven Fateshaper",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\nWhen this creature enters, ${LOOK}\n{4}{U}: Look at the top four cards of your library, then put them back in any order.`,
  activated: [
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 4, min: 4, max: 4, destination: "library-top", leftover: "stay" },
      resolve: null,
      text: "{4}{U}: Look at the top four cards of your library, then put them back in any order.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 4, min: 4, max: 4, destination: "library-top", leftover: "stay" },
      resolve: null,
      text: `When this creature enters, ${LOOK}`,
    },
  ],
});
