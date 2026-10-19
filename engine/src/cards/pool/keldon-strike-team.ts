import { defineCard } from "../define.js";

// EDHREC rank 26072.
//
// Rulings:
//   [2022-09-09] Keldon Strike Team's last ability grants itself haste in addition to any other
//     creatures you control.
//   [2022-09-09] Creatures that enter the battlefield after Keldon Strike Team on the turn it
//     entered the battlefield will have haste as long as it's still on the battlefield. Notably,
//     this includes the Soldier creature tokens it creates if it was kicked.
//
// "As long as this creature entered this turn" is a `source` condition on its
// own entry turn (Shardmage's Rescue's shape).

const ETB_TEXT = "When this creature enters, if it was kicked, create two 1/1 white Soldier creature tokens.";
const HASTE_TEXT = "As long as this creature entered this turn, creatures you control have haste.";

export default defineCard({
  name: "Keldon Strike Team",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: `Kicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\n${ETB_TEXT}\n${HASTE_TEXT}`,
  kicker: { cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "source", filter: { enteredThisTurn: true } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
});
