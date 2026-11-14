import { defineCard } from "../define.js";

// The modes and their targets are chosen as the trigger goes on the stack
// (`announced`), each mode a different player. The first mode's creature is
// the target player's choice, and they put the counters on it; the second's
// card is theirs to choose from their own graveyard.
const TRIGGER_TEXT = "When Mikey & Mona enter, choose one or both. Each mode must target a different player.";
const COUNTERS_MODE = "Target player chooses a creature they control and puts two +1/+1 counters on it.";
const RETURN_MODE = "Target player returns a creature or land card from their graveyard to their hand.";

export default defineCard({
  name: "Mikey & Mona, Mutant Sitters",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle", "Lizard"],
  power: 2,
  toughness: 2,
  text: `${TRIGGER_TEXT}\n• ${COUNTERS_MODE}\n• ${RETURN_MODE}`,
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
          {
            text: COUNTERS_MODE,
            targets: ["player"],
            effect: {
              kind: "as-player",
              who: { target: 0 },
              effect: {
                kind: "choose-permanents",
                filter: { type: "creature", controlledBy: "you" },
                min: 1,
                upTo: 1,
                prompt: "Put two +1/+1 counters on a creature you control",
                then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
              },
            },
          },
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
                filter: { typesAnyOf: ["creature", "land"] },
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
      text: `${TRIGGER_TEXT} ${COUNTERS_MODE} ${RETURN_MODE}`,
    },
  ],
});
