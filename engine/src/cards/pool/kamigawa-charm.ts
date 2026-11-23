import { defineCard } from "../define.js";

// Playtest card. Each mode is the named card's effect, the parenthetical its summary: Dosan's Oldest
// Chant, Kodama's Reach and Time of Need as the pool authors them.

const CHANT = "Dosan's Oldest Chant (Gain 6 life, draw a card.)";
const REACH = "Kodama's Reach (Search for two basic lands, put one onto the battlefield tapped and one to hand.)";
const NEED = "Time of Need (Search for a legend.)";

export default defineCard({
  name: "Kamigawa Charm",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose one —\n• ${CHANT}\n• ${REACH}\n• ${NEED}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: CHANT,
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: 6 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      {
        text: REACH,
        targets: [],
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          min: 0,
          max: 2,
          destination: "battlefield",
          enterTapped: true,
          restDestination: "hand",
          reveal: true,
        },
      },
      {
        text: NEED,
        targets: [],
        effect: {
          kind: "search-library",
          filter: { supertype: "legendary", type: "creature" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
    ],
  },
});
