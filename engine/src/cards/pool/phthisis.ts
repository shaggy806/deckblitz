import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 14598.
//
// Swords to Plowshares' shape: the creature's power and toughness are read as
// it last existed once it's gone (rule 608.2h), and the life loss happens even
// if it wasn't destroyed (indestructible — the ruling). A negative total is no
// life lost: amounts are floored at 0 once summed (`amountValue`), so a -1/3
// costs 2 and a -4/3 nothing (the ruling).
//
// Rulings:
//   [2021-03-19] If the target creature is an illegal target by the time Phthisis tries to
//     resolve, the spell doesn't resolve. No player loses life. If the target is legal but not
//     destroyed (most likely because it has indestructible), its controller does lose life.
//   [2021-03-19] If the creature's power is negative, you still add its power and toughness to
//     determine how much life is lost. If that total is negative, its controller doesn't gain or
//     lose any life. For example, Phthisis destroying a -1/3 creature would cause a loss of 2
//     life. Pthisis destroying a -4/3 creature would cause no loss of life.

export default defineCard({
  name: "Phthisis",
  manaCost: "{3}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  suspend: { n: 5, cost: "{1}{B}" },
  text: "Destroy target creature. Its controller loses life equal to its power plus its toughness.\nSuspend 5—{1}{B} (Rather than cast this card from your hand, you may pay {1}{B} and exile it with five time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "lose-life", amount: { sum: [{ powerOf: 0 }, { toughnessOf: 0 }] }, toControllerOfTarget: 0 },
    ],
  },
});
