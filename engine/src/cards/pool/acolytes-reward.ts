import { defineCard } from "../define.js";

// EDHREC rank 18777.
//
// Rulings:
//   Acolyte's Reward has two targets: the creature that would be dealt damage and the permanent
//   or player that Acolyte's Reward will deal damage to.
//   The amount of damage the prevention shield will prevent is based on your devotion to white
//   as Acolyte's Reward resolves. That amount won't change later in the turn.
//   The effect of Acolyte's Reward isn't a redirection effect. If it prevents damage, Acolyte's
//   Reward (not the source of that damage) deals damage to the second target as part of that
//   prevention effect. The new damage isn't combat damage.
//
// - Temper's shape: a `damage-rule` on the first target for the next X
//   (devotion read as it resolves), whose `then` deals "x" — the damage it
//   prevented — to the second target, from the spell.
export default defineCard({
  name: "Acolyte's Reward",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next X damage that would be dealt to target creature this turn, where X is your devotion to white. If damage is prevented this way, Acolyte's Reward deals that much damage to any target. (Each {W} in the mana costs of permanents you control counts toward your devotion to white.)",
  targets: ["creature", "any-target"],
  effect: {
    kind: "damage-rule",
    to: { target: 0 },
    amount: { devotionTo: "W" },
    then: { kind: "damage", amount: "x", target: 1 },
  },
});
