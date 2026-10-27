import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 31306.
//
// Rulings:
//   [2005-08-01] Being "enchanted" means there is an Aura on it.
const TEXT = "This creature can't be blocked as long as it's enchanted.";

export default defineCard({
  name: "Metathran Elite",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Metathran", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      grantKeywords: ["unblockable"],
      text: TEXT,
    },
  ],
});
