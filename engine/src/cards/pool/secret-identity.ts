import { defineCard } from "../define.js";

// EDHREC rank 10435.

// Each mode is an `animate` with no new card type: "becomes a Citizen" sets
// its creature types (rule 205.1a — `setSubtypes`), and the base P/T and
// keywords come with it, all until end of turn.
const CONCEAL_MODE =
  "Conceal — Until end of turn, target creature you control becomes a Citizen with base power and toughness 1/1 and gains hexproof.";
const REVEAL_MODE =
  "Reveal — Until end of turn, target creature you control becomes a Hero with base power and toughness 3/4 and gains flying and vigilance.";

export default defineCard({
  name: "Secret Identity",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${CONCEAL_MODE}\n• ${REVEAL_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: CONCEAL_MODE,
        targets: ["creature-you-control"],
        effect: {
          kind: "animate",
          target: 0,
          power: 1,
          toughness: 1,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Citizen"],
          keywords: ["hexproof"],
          duration: "end-of-turn",
        },
      },
      {
        text: REVEAL_MODE,
        targets: ["creature-you-control"],
        effect: {
          kind: "animate",
          target: 0,
          power: 3,
          toughness: 4,
          addTypes: [],
          addSubtypes: [],
          setSubtypes: ["Hero"],
          keywords: ["flying", "vigilance"],
          duration: "end-of-turn",
        },
      },
    ],
  },
});
