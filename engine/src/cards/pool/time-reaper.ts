import { defineCard } from "../define.js";

// Doctor Who. "If you do": a commander may have gone to the command zone
// instead (rule 903.9b), so it asks where the card went.
const TEXT =
  "Consume Anomaly — Whenever this creature deals combat damage to a player, put target face-up card they own in exile on the bottom of their library. If you do, you gain 3 life.";

export default defineCard({
  name: "Time Reaper",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Alien", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-exile", whose: "trigger-player", faceUp: true }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-on-library", target: 0, position: "bottom" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { inZone: "library" } },
            then: { kind: "gain-life", amount: 3 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
