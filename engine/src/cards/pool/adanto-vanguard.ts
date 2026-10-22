import { defineCard } from "../define.js";

// EDHREC rank 16912.
//
// Rulings:
//   [2019-01-25] An ability that triggers whenever a creature with a certain power attacks uses
//     Adanto Vanguard's power after it has +2/+0 to determine whether it triggers.

const ATTACK_TEXT = "As long as this creature is attacking, it gets +2/+0.";
const LIFE_TEXT = "Pay 4 life: This creature gains indestructible until end of turn.";

export default defineCard({
  name: "Adanto Vanguard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${ATTACK_TEXT}\nPay 4 life: This creature gains indestructible until end of turn. (Damage and effects that say "destroy" don't destroy it.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantPt: [2, 0],
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 4 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
