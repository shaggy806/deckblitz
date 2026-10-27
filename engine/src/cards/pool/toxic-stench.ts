import { defineCard } from "../define.js";

// Threshold is read as the spell resolves ("instead"): destroy, unregenerable,
// in place of the -1/-1.
export default defineCard({
  name: "Toxic Stench",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target nonblack creature gets -1/-1 until end of turn.\nThreshold — If there are seven or more cards in your graveyard, instead destroy that creature. It can't be regenerated.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: { kind: "destroy", target: 0, cantBeRegenerated: true },
    else: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
  },
});
