import { defineCard } from "../define.js";

// EDHREC rank 30336.
//
// Rulings:
//   If both abilities are used on the same creature, it can't block Burning-Tree Bloodscale.

const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";

export default defineCard({
  name: "Burning-Tree Bloodscale",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Berserker"],
  power: 2,
  toughness: 2,
  text: `${BLOODTHIRST}\n{2}{R}: Target creature can't block this creature this turn.\n{2}{G}: Target creature blocks this creature this turn if able.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "cant-block", attacker: "source" }]},
      resolve: null,
      text: "{2}{R}: Target creature can't block this creature this turn.",
    },
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "must-block", attacker: "source" }] },
      resolve: null,
      text: "{2}{G}: Target creature blocks this creature this turn if able.",
    },
  ],
});
