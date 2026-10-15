import { defineCard } from "../define.js";

const RAID_TEXT = "Raid — This creature enters with a +1/+1 counter on it if you attacked this turn.";

export default defineCard({
  name: "Goblin Boarders",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Pirate"],
  power: 3,
  toughness: 2,
  text: RAID_TEXT,
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
