import { defineCard } from "../define.js";

// EDHREC rank 26601.

const RAID_TEXT =
  "Raid — {3}{R}{R}: Return this card from your graveyard to your hand. Activate only if you attacked this turn.";

export default defineCard({
  name: "Repeating Barrage",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Repeating Barrage deals 3 damage to any target.\n${RAID_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RAID_TEXT,
    },
  ],
});
