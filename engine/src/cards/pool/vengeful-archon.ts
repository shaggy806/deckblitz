import { defineCard } from "../define.js";

// EDHREC rank 25807.
//
// Rulings:
//   The effect of Vengeful Archon's ability is not a redirection effect. If it prevents damage,
//   Vengeful Archon (not the source of that damage) deals damage to the targeted player as part
//   of that prevention effect. The new damage is not combat damage.
//   The only target of Vengeful Archon's ability is the player it may deal damage to. You choose
//   that target as you activate the ability.
//   If Vengeful Archon's ability doesn't prevent any damage, Vengeful Archon won't deal any
//   damage itself.
//
// - Temper's shape on you: the next X damage to you this turn, its `then`
//   dealing "x" — what it prevented — from the Archon to the target.
const ABILITY_TEXT =
  "{X}: Prevent the next X damage that would be dealt to you this turn. If damage is prevented this way, this creature deals that much damage to target player or planeswalker.";

export default defineCard({
  name: "Vengeful Archon",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "damage-rule",
        to: { players: "you" },
        amount: "x",
        then: { kind: "damage", amount: "x", target: 0 },
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
