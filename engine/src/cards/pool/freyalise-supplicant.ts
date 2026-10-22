import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 29955. The sacrificed creature's power as it
// last existed on the battlefield, halved and rounded down (rule 107.1a).

const TEXT =
  "{T}, Sacrifice a red or white creature: This creature deals damage to any target equal to half the sacrificed creature's power, rounded down.";

export default defineCard({
  name: "Freyalise Supplicant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: {
          filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["R"] }, { colors: ["W"] }] },
        },
      },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { half: { powerOf: "sacrificed" }, round: "down" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
