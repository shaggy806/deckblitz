import { defineCard } from "../define.js";

// EDHREC rank 15408.
//
// Rulings:
//   The keyword is chosen as the second ability resolves (a resolution-time
//     `modal`, Shifting Ceratops's shape, here with a target).
//   Golem Artisan can target itself.

const PUMP_TEXT = "{2}: Target artifact creature gets +1/+1 until end of turn.";
const GRANT_TEXT = "{2}: Target artifact creature gains your choice of flying, trample, or haste until end of turn.";
const ARTIFACT_CREATURE = { kind: "permanent", filter: { types: ["artifact", "creature"] } } as const;

export default defineCard({
  name: "Golem Artisan",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: `${PUMP_TEXT}\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [ARTIFACT_CREATURE],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [ARTIFACT_CREATURE],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Flying", effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" } },
          { text: "Trample", effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" } },
          { text: "Haste", effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
