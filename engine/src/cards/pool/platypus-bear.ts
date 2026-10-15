import { defineCard } from "../define.js";

// EDHREC rank 23188.
//
// Rulings:
//   [2025-10-02] Once Platypus-Bear has attacked, it will remain an attacking creature for that
//     combat, even if the Lesson card is removed from your graveyard.
//
// Surveillance Phantasm's conditional "can attack as though it didn't have
// defender" — checked only as attackers are declared.

const MILL_TEXT = "When this creature enters, mill two cards.";
const ATTACK_TEXT =
  "As long as there is a Lesson card in your graveyard, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Platypus-Bear",
  manaCost: "{1}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Platypus", "Bear"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${MILL_TEXT} (Put the top two cards of your library into your graveyard.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Lesson" } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
