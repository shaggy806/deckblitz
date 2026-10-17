import { defineCard } from "../define.js";

// EDHREC rank 7725.
//
// "That player" is the destroyed creature's controller, read as it last
// existed (Sip of Hemlock's `toControllerOfTarget`).

const ENTER_TEXT =
  "Exterminate! — When this creature enters, destroy target creature an opponent controls. That player loses 3 life.";

export default defineCard({
  name: "Dalek Drone",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Dalek"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "menace"],
  text: `Flying, menace\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
