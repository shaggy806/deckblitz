import { defineCard } from "../define.js";

// EDHREC rank 21126. Khans of Tarkir.
//
// The keyword is chosen as the ability resolves (the ruling) — a modal
// effect, not an announced one (Ezrim, Agency Chief's shape).

const SAC_TEXT = "Sacrifice another creature: This creature gains your choice of vigilance, lifelink, or haste until end of turn.";

export default defineCard({
  name: "Butcher of the Horde",
  manaCost: "{1}{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Vigilance", effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" } },
          { text: "Lifelink", effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" } },
          { text: "Haste", effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
