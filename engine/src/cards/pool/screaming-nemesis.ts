import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature is dealt damage, it deals that much damage to any other target. If a player is dealt damage this way, they can't gain life for the rest of the game.";

// EDHREC rank 3715.
export default defineCard({
  name: "Screaming Nemesis",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [{ kind: "other", of: "any-target" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { triggerValue: true }, target: 0 },
          { kind: "prohibit", prohibits: [{ act: "gain-life", who: "players-dealt-damage-this-way" }], duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
