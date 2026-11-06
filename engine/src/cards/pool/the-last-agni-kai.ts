import { defineCard } from "../define.js";

// EDHREC rank 1942.
//
// Rulings:
//   [2025-10-02] In some cases, the creature you control that is fighting may have deathtouch.
//     Even 1 damage dealt to a creature from a source with deathtouch is considered lethal damage,
//     so any amount greater than that will cause excess damage to be dealt, even if the total
//     amount of damage isn't greater than the opponent's creature's toughness.
//   [2025-10-02] Excess damage has been dealt to a creature if the damage dealt to it is greater
//     than lethal damage. Usually, this means damage greater than its toughness, although damage
//     already marked on the creature is taken into account.
//
// The excess is Rhino's Rampage's, read for the second target alone (rule
// 120.4a, deathtouch's lethal 1 included). "Until end of turn, you don't lose
// unspent red mana" is a `player-effect`'s `keepsUnspentMana` — every {R} in
// your pool this turn, not just what this added — gone as the cleanup step
// ends, and the pool empties straight after (rule 500.5).
export default defineCard({
  name: "The Last Agni Kai",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control fights target creature an opponent controls. If the creature the opponent controls is dealt excess damage this way, add that much {R}.\nUntil end of turn, you don't lose unspent red mana as steps and phases end.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1 },
      { kind: "add-mana", mana: "R", amount: { excessDamageThisWay: true, to: 1 } },
      { kind: "player-effect", duration: "end-of-turn", keepsUnspentMana: ["R"] },
    ],
  },
});
