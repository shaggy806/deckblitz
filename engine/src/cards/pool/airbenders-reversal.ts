import { defineCard } from "../define.js";

// EDHREC rank 4196.
//
// Rulings: airbend's — its owner may cast the card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
//
// Airbending your own creature saves it and lets you recast it for {2}.
const DESTROY_MODE = "Destroy target attacking creature.";
const AIRBEND_MODE = "Airbend target creature you control.";

export default defineCard({
  name: "Airbender's Reversal",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text:
    `Choose one —\n• ${DESTROY_MODE}\n• ${AIRBEND_MODE} ` +
    "(Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DESTROY_MODE,
        targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: AIRBEND_MODE,
        targets: ["creature-you-control"],
        effect: { kind: "exile", target: 0, airbend: true },
      },
    ],
  },
});
