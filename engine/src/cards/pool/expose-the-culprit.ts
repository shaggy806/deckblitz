import { defineCard } from "../define.js";

// The second mode targets nothing: the creatures are chosen as it resolves, and
// exiled and cloaked as one instruction over all of them.
const TURN_UP = "Turn target face-down creature face up.";
const CLOAK =
  "Exile any number of face-up creatures you control with disguise in a face-down pile, shuffle that pile, then cloak them. (To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. Turn it face up any time for its mana cost if it's a creature card.)";
const WITH_DISGUISE = { type: "creature", controlledBy: "you", faceDown: false, hasKeyword: "disguise" } as const;

export default defineCard({
  name: "Expose the Culprit",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one or both —\n• ${TURN_UP}\n• ${CLOAK}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: TURN_UP,
        targets: [{ kind: "permanent", filter: { type: "creature", faceDown: true } }],
        effect: { kind: "turn-face-up", target: 0 },
      },
      {
        text: CLOAK,
        targets: [],
        effect: {
          kind: "choose-permanents",
          filter: WITH_DISGUISE,
          upTo: { countOf: WITH_DISGUISE },
          thenTogether: true,
          then: { kind: "cloak-exiled-pile" },
          prompt: "Exile any number of face-up creatures you control with disguise, then cloak them",
        },
      },
    ],
  },
});
