import { defineCard } from "../define.js";

// EDHREC rank 12480.
//
// Rulings:
//   [2025-04-04] The value of X is calculated only once, as Marshal of the Lost’s last ability
//     resolves.
//
// "The number of attacking creatures" is every attacking creature, whoever
// controls it (Jazal Goldmane's count), read as the ability resolves.

const ATTACK_TEXT =
  "Whenever you attack, target creature gets +X/+X until end of turn, where X is the number of attacking creatures.";
const ATTACKING = { countOf: { type: "creature", attacking: true } } as const;

export default defineCard({
  name: "Marshal of the Lost",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: ATTACKING, toughness: ATTACKING, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
