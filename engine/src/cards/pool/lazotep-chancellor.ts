import { defineCard } from "../define.js";

// EDHREC rank 7188. Modern Horizons 2.
//
// "Whenever you discard a card" fires once per card discarded (`perCard`),
// so discarding two offers the {1} twice. Amass Zombies 2 makes the 0/0
// Zombie Army first when you control no Army (its rulings).
const TEXT =
  "Whenever you discard a card, you may pay {1}. If you do, amass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)";

export default defineCard({
  name: "Lazotep Chancellor",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to amass Zombies 2?",
        cost: "{1}",
        effect: { kind: "amass", amount: 2, creatureType: "Zombie" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
