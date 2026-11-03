import { defineCard } from "../define.js";

// Wrathful Red Dragon's shape. Its rulings: it triggers for each Dinosaur dealt
// damage at once, once for damage from several sources at once to one Dinosaur,
// and any non-Dinosaur creature, planeswalker, battle or player can be chosen.

const TEXT = "Whenever a Dinosaur you control is dealt damage, it deals that much damage to any target that isn't a Dinosaur.";

export default defineCard({
  name: "Wrathful Raptors",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "any", filter: { subtype: "Dinosaur", controlledBy: "you" } },
      targets: [
        {
          kind: "permanent",
          filter: { typesAnyOf: ["creature", "planeswalker", "battle"], notSubtypes: ["Dinosaur"] },
          orPlayer: "any",
        },
      ],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0, from: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
