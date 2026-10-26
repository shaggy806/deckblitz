import { defineCard } from "../define.js";

// Dissension. EDHREC rank 31404.

const PUMP_TEXT = "{R}: This creature gets +1/+0 until end of turn.";
const TEXT = `As long as this creature is enchanted, it gets +2/+2, has trample, and has "${PUMP_TEXT}"`;

export default defineCard({
  name: "Flaring Flame-Kin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      grantPt: [2, 2],
      grantKeywords: ["trample"],
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
