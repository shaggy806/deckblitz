import { defineCard } from "../define.js";

// Playtest card. "Choose one. Destroy target creature, then —": every mode
// destroys the target first, so each is the destroy followed by its bullet.
// The menace counter goes on a creature chosen as it resolves (Blood Curdle);
// the mill reads the destroyed creature's power as it last existed (Grisly
// Spectacle).

const FOOD = "Create a Food token.";
const TREASURE = "Create a Treasure token.";
const MENACE = "Put a menace counter on a creature you control.";
const MILL = "That creature's controller mills cards equal to its power.";

export default defineCard({
  name: "Common Black Removal",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Choose one. Destroy target creature, then —\n• ${FOOD}\n• ${TREASURE}\n• ${MENACE}\n• ${MILL}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: FOOD,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "create-token", token: "Food Token", count: 1 },
          ],
        },
      },
      {
        text: TREASURE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "create-token", token: "Treasure Token", count: 1 },
          ],
        },
      },
      {
        text: MENACE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              min: 1,
              upTo: 1,
              prompt: "Choose a creature you control to put a menace counter on",
              then: { kind: "add-counter", target: 0, counter: "menace", amount: 1 },
            },
          ],
        },
      },
      {
        text: MILL,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "mill", target: 0, amount: { powerOf: 0 } },
          ],
        },
      },
    ],
  },
});
