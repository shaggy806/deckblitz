import { defineCard } from "../define.js";

// EDHREC rank 21926. The first mode is Imperial Edict's choice, so a hexproof
// creature can be chosen (the ruling); the second does nothing with only lands
// in hand, and never falls back on the first (the ruling).
export default defineCard({
  name: "Doomfall",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Target opponent exiles a creature they control.\n• Target opponent reveals their hand. You choose a nonland card from it. Exile that card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target opponent exiles a creature they control.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "vote",
              choose: true,
              who: { target: 0 },
              for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
            },
            { kind: "for-each-voted", which: "voted", effect: { kind: "exile", target: 0 } },
          ],
        },
      },
      {
        text: "Target opponent reveals their hand. You choose a nonland card from it. Exile that card.",
        targets: ["opponent"],
        effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      },
    ],
  },
});
