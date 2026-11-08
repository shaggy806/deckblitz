import { defineCard } from "../define.js";

// EDHREC rank 861.
//
// Rulings:
//   Bloodletter of Aclazotz's last ability doesn't change the amount of damage
//     dealt to opponents: a 1/1 with lifelink has them lose 2 and you gain 1.
//
// `would-lose-life` reads every loss (rule 119): an effect's, damage's, a life
// payment's (119.4).
const TEXT = "If an opponent would lose life during your turn, they lose twice that much life instead. (Damage causes loss of life.)";

export default defineCard({
  name: "Bloodletter of Aclazotz",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Demon"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      replacement: { event: "would-lose-life", who: "opponent", instead: { modify: { times: 2 } } },
      text: "If an opponent would lose life during your turn, they lose twice that much life instead.",
    },
  ],
});
