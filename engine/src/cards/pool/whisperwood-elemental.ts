import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of your end step, manifest the top card of your library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";
const SAC_TEXT =
  'Sacrifice this creature: Until end of turn, face-up nontoken creatures you control gain "When this creature dies, manifest the top card of your library."';

// The grant reaches the creatures there as it resolves (the ruling).
export default defineCard({
  name: "Whisperwood Elemental",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: `${END_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-triggered-all",
        filter: { type: "creature", controlledBy: "you", token: false, faceDown: false },
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "manifest", who: "you" },
          resolve: null,
          text: "When this creature dies, manifest the top card of your library.",
        },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
