import { defineCard } from "../define.js";

// EDHREC rank 21091. Goblin Boarders' raid.

const RAID_TEXT = "Raid — This creature enters with a +1/+1 counter on it if you attacked this turn.";

export default defineCard({
  name: "Storm Fleet Aerialist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${RAID_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: RAID_TEXT,
    },
  ],
});
