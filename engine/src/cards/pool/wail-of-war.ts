import { defineCard } from "../define.js";

// EDHREC rank 14366.

const SHRINK_MODE = "Creatures target opponent controls get -1/-1 until end of turn.";
const RETURN_MODE = "Return up to two target creature cards from your graveyard to your hand.";
const CREATURE_CARD = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;

export default defineCard({
  name: "Wail of War",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Choose one —\n• ${SHRINK_MODE}\n• ${RETURN_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SHRINK_MODE,
        targets: ["opponent"],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
          power: -1,
          toughness: -1,
          duration: "end-of-turn",
        },
      },
      {
        text: RETURN_MODE,
        targets: [
          { kind: "optional", of: CREATURE_CARD },
          { kind: "optional", of: { kind: "other", of: CREATURE_CARD, than: { slots: [0] } } },
        ],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            { kind: "return-to-hand", target: 1, from: "graveyard" },
          ],
        },
      },
    ],
  },
});
