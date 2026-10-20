import { defineCard } from "../define.js";

// EDHREC rank 28496. "If a Werewolf is dealt damage this way" is The Black
// Arrow's shape: damage was dealt to the target, and it's a Werewolf.
const TEXT =
  "{3}, {T}, Sacrifice this artifact: It deals 3 damage to target creature. If a Werewolf is dealt damage this way, destroy it.";

export default defineCard({
  name: "Silver Bolt",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "damage-dealt-this-way", to: 0 },
                { kind: "target", index: 0, filter: { subtype: "Werewolf" } },
              ],
            },
            then: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
