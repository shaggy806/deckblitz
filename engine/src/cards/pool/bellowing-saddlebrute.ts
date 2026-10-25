import { defineCard } from "../define.js";

// EDHREC rank 29695. Khans of Tarkir.
//
// "Unless you attacked this turn" isn't an intervening if: the ability always
// triggers and checks raid as it resolves.

const RAID_TEXT = "Raid — When this creature enters, you lose 4 life unless you attacked this turn.";

export default defineCard({
  name: "Bellowing Saddlebrute",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 4,
  toughness: 5,
  text: RAID_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 } },
        then: { kind: "lose-life", amount: 4 },
      },
      resolve: null,
      text: RAID_TEXT,
    },
  ],
});
