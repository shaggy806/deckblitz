import { defineCard } from "../define.js";

// Theros Beyond Death. Twice X is one 2X hit, not two X hits (its ruling).

export default defineCard({
  name: "Purphoros's Intervention",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Create an X/1 red Elemental creature token with trample and haste. Sacrifice it at the beginning of the next end step.\n• Purphoros's Intervention deals twice X damage to target creature or planeswalker.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Create an X/1 red Elemental creature token with trample and haste. Sacrifice it at the beginning of the next end step.",
        targets: [],
        effect: {
          kind: "create-token",
          token: "X/1 Elemental Token (Trample, Haste)",
          count: 1,
          basePt: { power: "x", toughness: 1 },
          sacrificeAtEndStep: true,
        },
      },
      {
        text: "Purphoros's Intervention deals twice X damage to target creature or planeswalker.",
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", amount: { product: [2, "x"] }, target: 0 },
      },
    ],
  },
});
