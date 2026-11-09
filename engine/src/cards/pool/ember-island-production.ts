import { defineCard } from "../define.js";

// Both modes target, so this is a cast-time `castModal`. The second mode's token
// is yours: the spell's controller creates it (rule 111.2).
export default defineCard({
  name: "Ember Island Production",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "Choose one —\n" +
    "• Create a token that's a copy of target creature you control, except it's not legendary and it's a 4/4 Hero in addition to its other types.\n" +
    "• Create a token that's a copy of target creature an opponent controls, except it's not legendary and it's a 2/2 Coward in addition to its other types.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Create a token that's a copy of target creature you control, except it's not legendary and it's a 4/4 Hero in addition to its other types.",
        targets: ["creature-you-control"],
        effect: {
          kind: "create-token-copy",
          of: 0,
          count: 1,
          who: "you",
          exceptions: { removeSupertypes: ["legendary"], addSubtypes: ["Hero"], power: 4, toughness: 4 },
        },
      },
      {
        text: "Create a token that's a copy of target creature an opponent controls, except it's not legendary and it's a 2/2 Coward in addition to its other types.",
        targets: ["creature-an-opponent-controls"],
        effect: {
          kind: "create-token-copy",
          of: 0,
          count: 1,
          who: "you",
          exceptions: { removeSupertypes: ["legendary"], addSubtypes: ["Coward"], power: 2, toughness: 2 },
        },
      },
    ],
  },
});
