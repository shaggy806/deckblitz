import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] If a creature's power is less than 0 when it's doubled, instead that creature
//     gets -X/-0, where X is how much less than 0 its power is.
//   [2021-07-23] If an effect instructs you to "double" a creature's power, that creature gets
//     +X/+0, where X is its power as that effect begins to apply. The same is true for toughness.

const DOUBLE_TEXT = "Two-Weapon Fighting — Double target creature's power and toughness until end of turn.";
const ARCHERY_TEXT = "Archery — This spell deals 5 damage to target creature with flying.";

export default defineCard({
  name: "Choose Your Weapon",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${DOUBLE_TEXT}\n• ${ARCHERY_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DOUBLE_TEXT,
        targets: ["creature"],
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { powerOf: 0, doubling: true },
          toughness: { toughnessOf: 0, doubling: true },
          duration: "end-of-turn",
        },
      },
      {
        text: ARCHERY_TEXT,
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
    ],
  },
});
