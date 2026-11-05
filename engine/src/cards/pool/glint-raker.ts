import { defineCard } from "../define.js";

// Ruling: an artifact with {X} in its mana cost has mana value with X as 0.
// "Put an artifact card revealed this way into your hand": one, if any was
// revealed; the rest go to the graveyard.

const PT_TEXT = "This creature gets +X/+0, where X is the greatest mana value among artifacts you control.";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, you may reveal that many cards from the top of your library. Put an artifact card revealed this way into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Glint Raker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        aggregate: { aggregate: "max", of: "mana-value", filter: { type: "artifact", controlledBy: "you" } },
        pt: [1, 0],
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal that many cards from the top of your library?",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: { triggerValue: true },
          reveal: true,
          min: 1,
          max: 1,
          filter: { type: "artifact" },
          destination: "hand",
          leftover: "graveyard",
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
