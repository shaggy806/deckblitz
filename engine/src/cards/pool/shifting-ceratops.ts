import { defineCard } from "../define.js";

// Core Set 2020. The keyword is chosen as the ability resolves (Assassin
// Initiate's shape).
const PUMP_TEXT = "{G}: This creature gains your choice of reach, trample, or haste until end of turn.";

export default defineCard({
  name: "Shifting Ceratops",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 4,
  cantBeCountered: true,
  text: `This spell can't be countered.\nProtection from blue\n${PUMP_TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { effect: { kind: "grant-keyword", target: "source", keyword: "reach", duration: "end-of-turn" }, text: "Reach" },
          { effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" }, text: "Trample" },
          { effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" }, text: "Haste" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
