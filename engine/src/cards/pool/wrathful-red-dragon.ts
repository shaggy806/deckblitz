import { defineCard } from "../define.js";

// The damaged Dragon deals the damage, as it last existed if the damage killed it.
// "Any target" is a creature, player, planeswalker or battle (rule 115.4), and only
// the permanents among them can be Dragons.

const TEXT = "Whenever a Dragon you control is dealt damage, it deals that much damage to any target that isn't a Dragon.";

export default defineCard({
  name: "Wrathful Red Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "any", filter: { subtype: "Dragon", controlledBy: "you" } },
      targets: [
        {
          kind: "permanent",
          filter: { typesAnyOf: ["creature", "planeswalker", "battle"], notSubtypes: ["Dragon"] },
          orPlayer: "any",
        },
      ],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0, from: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
