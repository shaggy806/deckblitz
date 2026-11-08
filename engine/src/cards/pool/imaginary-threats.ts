import { defineCard } from "../define.js";

// Both halves read the player's creatures as they come to matter — as
// attackers are declared this turn, and at their next untap step — so one
// that entered since is held too (Misstep's ruling).
const TEXT =
  "Creatures target opponent controls attack this turn if able. During that player's next untap step, creatures they control don't untap.";

export default defineCard({
  name: "Imaginary Threats",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  targets: ["opponent"],
  cycling: { cost: "{2}" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", filter: { controlledBy: "you", type: "creature" }, controlledByTarget: 0, restrictions: ["must-attack"], duration: "end-of-turn" },
      { kind: "skip-next-untap", filter: { type: "creature" }, who: 0 },
    ],
  },
});
