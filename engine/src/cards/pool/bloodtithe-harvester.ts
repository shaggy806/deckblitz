import { defineCard } from "../define.js";

// Rulings:
//   [2025-01-24] The value of X is determined only once, as Bloodtithe Harvester's last ability
//     resolves.
//   [2025-01-24] If an effect refers to a Blood token, it means any artifact token with the
//     subtype Blood, even if it has gained other subtypes.

const ETB_TEXT = "When this creature enters, create a Blood token.";
const SAC_TEXT =
  "{T}, Sacrifice this creature: Target creature gets -X/-X until end of turn, where X is twice the number of Blood tokens you control. Activate only as a sorcery.";

const MINUS_TWICE_BLOOD = {
  product: [{ countOf: { type: "artifact", subtype: "Blood", token: true, controlledBy: "you" } }, -2],
} as const;

export default defineCard({
  name: "Bloodtithe Harvester",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 2,
  text: `${ETB_TEXT} (It's an artifact with "{1}, {T}, Discard a card, Sacrifice this token: Draw a card.")\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: MINUS_TWICE_BLOOD,
        toughness: MINUS_TWICE_BLOOD,
        duration: "end-of-turn",
      },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
});
