import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 30775. Kuldotha Phoenix's graveyard shape, the
// Swamp checked as the ability is activated — before its cost is paid — so a
// last Swamp may be one of the two lands sacrificed (the ruling).
//
// Rulings:
//   [2004-10-04] The ability works even if you sacrifice your last swamp to activate it. It only
//     checks for a swamp on activation.

const TEXT =
  "Sacrifice two lands: Return this card from your graveyard to the battlefield. Activate only during your upkeep and only if you control a Swamp.";

export default defineCard({
  name: "Coffin Puppets",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" }, count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          { kind: "turn-structure", steps: ["upkeep"] },
          { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
        ],
      },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
