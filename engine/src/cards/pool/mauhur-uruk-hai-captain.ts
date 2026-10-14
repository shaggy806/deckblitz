import { defineCard } from "../define.js";

// EDHREC rank 4464.
//
// Rulings:
//   [2023-06-16] Mauhúr's last ability applies to counters placed on Army tokens when you amass
//     Orcs (or Zombies, or anything else.)

export default defineCard({
  name: "Mauhúr, Uruk-hai Captain",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace\nIf one or more +1/+1 counters would be put on an Army, Goblin, or Orc you control, that many plus one +1/+1 counters are put on it instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { subtypes: ["Army", "Goblin", "Orc"] } },
      text: "If one or more +1/+1 counters would be put on an Army, Goblin, or Orc you control, that many plus one +1/+1 counters are put on it instead.",
    },
  ],
});
