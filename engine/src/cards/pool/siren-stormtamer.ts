import { defineCard } from "../define.js";

// "That targets you or a creature you control": `targeting` with `player` and
// `permanent`, either will do. One of several targets is enough, and a creature
// that has left is no longer one (the rulings; `stackObjectTargetsMatch`).
const TEXT = "{U}, Sacrifice this creature: Counter target spell or ability that targets you or a creature you control.";

export default defineCard({
  name: "Siren Stormtamer",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "stack",
          spells: "any",
          abilities: true,
          targeting: { player: "you", permanent: { type: "creature", controlledBy: "you" } },
        },
      ],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
