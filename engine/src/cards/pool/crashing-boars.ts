import { defineCard } from "../define.js";

// Mirage (MIR). The defending player chooses the creature as the trigger
// resolves — not a target — and it must block this creature this turn if
// able (`block-if-able`, Giant Ambush Beetle's shape).

const TEXT =
  "Whenever this creature attacks, defending player chooses an untapped creature they control. That creature blocks this creature this turn if able.";

export default defineCard({
  name: "Crashing Boars",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "trigger-player",
        filter: { type: "creature", controlledBy: "you", tapped: false },
        min: 1,
        upTo: 1,
        then: { kind: "block-if-able", target: 0, attacker: "source" },
        prompt: "Choose an untapped creature you control to block Crashing Boars this turn if able",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
