import { defineCard } from "../define.js";

// EDHREC rank 27894.

export default defineCard({
  name: "Test of Conviction",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose one —\n• Battle Stations — Put a +1/+1 counter on each creature you control.\n• Begin Negotiations — Target opponent draws a card. You draw two cards.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Battle Stations — Put a +1/+1 counter on each creature you control.",
        effect: {
          kind: "add-counter-all",
          filter: { type: "creature", controlledBy: "you" },
          counter: "+1/+1",
          amount: 1,
        },
      },
      {
        text: "Begin Negotiations — Target opponent draws a card. You draw two cards.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1, target: 0 },
            { kind: "draw", amount: 2 },
          ],
        },
      },
    ],
  },
});
