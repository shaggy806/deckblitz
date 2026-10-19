import { defineCard } from "../define.js";

// EDHREC rank 8058.
//
// A modal triggered ability announces its mode as it goes on the stack, and
// each mode brings its own target (Apothecary Stomper's shape).
const EXECUTIONER = "Executioner Round — Destroy target creature.";
const HYPERFRAG = "Hyperfrag Round — Creatures target player controls get -2/-2 until end of turn.";

export default defineCard({
  name: "Primaris Eliminator",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 3,
  toughness: 2,
  text: `When this creature enters, choose one —\n• ${EXECUTIONER}\n• ${HYPERFRAG}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: EXECUTIONER, targets: ["creature"], effect: { kind: "destroy", target: 0 } },
          {
            text: HYPERFRAG,
            targets: ["player"],
            effect: {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              controlledByTarget: 0,
              power: -2,
              toughness: -2,
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
