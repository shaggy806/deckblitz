import { defineCard } from "../define.js";

// EDHREC rank 8375.
//
// "Choose creature or land" is made as the spell resolves (rule 608.2), so it's
// a resolution-time `modal`; then every revealed card of the chosen type goes to
// hand (Mulch's shape) and the rest to the graveyard.

const revealFour = (type: "creature" | "land") =>
  ({
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: true,
    min: 4,
    max: 4,
    filter: { type },
    destination: "hand",
    leftover: "graveyard",
  }) as const;

export default defineCard({
  name: "Winding Way",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose creature or land. Reveal the top four cards of your library. Put all cards of the chosen type revealed this way into your hand and the rest into your graveyard.",
  targets: [],
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Creature", effect: revealFour("creature") },
      { text: "Land", effect: revealFour("land") },
    ],
  },
});
