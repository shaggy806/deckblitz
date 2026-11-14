import { defineCard } from "../define.js";

// The modes and their targets are chosen as the trigger goes on the stack
// (`announced`), each mode a different player. The returned card is the
// target player's choice, from their own graveyard.
const TRIGGER_TEXT = "When Donnie & April enter, choose one or both. Each mode must target a different player.";
const DRAW_MODE = "Target player draws two cards.";
const RETURN_MODE = "Target player returns an artifact, instant, or sorcery card from their graveyard to their hand.";

export default defineCard({
  name: "Donnie & April, Adorkable Duo",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Human", "Turtle"],
  power: 3,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n• ${DRAW_MODE}\n• ${RETURN_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        eachTargetsDifferentPlayer: true,
        minModes: 1,
        maxModes: 2,
        modes: [
          { text: DRAW_MODE, targets: ["player"], effect: { kind: "draw", amount: 2, target: 0 } },
          {
            text: RETURN_MODE,
            targets: ["player"],
            effect: {
              kind: "for-each-player",
              who: { target: 0 },
              effect: {
                kind: "look-and-choose",
                player: "that-player",
                zone: "graveyard",
                filter: { typesAnyOf: ["artifact", "instant", "sorcery"] },
                min: 1,
                max: 1,
                destination: "hand",
                leftover: "stay",
              },
            },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${DRAW_MODE} ${RETURN_MODE}`,
    },
  ],
});
