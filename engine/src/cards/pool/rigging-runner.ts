import { defineCard } from "../define.js";

// EDHREC rank 18626. Raid — Goblin Boarders' enters-with-counter replacement.

const RAID_TEXT = "Raid — This creature enters with a +1/+1 counter on it if you attacked this turn.";

export default defineCard({
  name: "Rigging Runner",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Pirate"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${RAID_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { ifCondition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 }, then: 1, else: 0 },
        },
      },
      text: RAID_TEXT,
    },
  ],
});
