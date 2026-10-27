import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 10613. Mirrodin.
//
// "This creature or another artifact creature dies" is the two triggers
// `thisOrAnother` writes, the second over any player's artifact creatures. The
// target is chosen as the trigger goes on the stack; the untap is optional.

const TEXT = "Whenever this creature or another artifact creature dies, you may untap target artifact.";

export default defineCard({
  name: "Dross Scorpion",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scorpion"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "dies", who: "any", filter: { types: ["artifact", "creature"] } },
      targets: ["artifact"],
      effect: { kind: "may", prompt: "Untap the target artifact?", effect: { kind: "untap", target: 0 } },
      resolve: null,
      text: TEXT,
    }),
  ],
});
