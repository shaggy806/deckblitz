import { defineCard } from "../define.js";

// EDHREC rank 26428. Khans of Tarkir.

const RAID_TEXT = "Raid — This creature enters with a +1/+1 counter on it if you attacked this turn.";

export default defineCard({
  name: "War-Name Aspirant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: `${RAID_TEXT}\nThis creature can't be blocked by creatures with power 1 or less.`,
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
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 1 } },
      text: "This creature can't be blocked by creatures with power 1 or less.",
    },
  ],
});
