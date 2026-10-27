import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 18335. Turn to Mist's delayed return, on a creature you control.

export default defineCard({
  name: "Liberate",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
  targets: ["creature-you-control"],
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    returnText: "Return the exiled card to the battlefield under its owner's control.",
  },
});
