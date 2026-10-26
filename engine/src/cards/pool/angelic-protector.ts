import { defineCard } from "../define.js";

// EDHREC rank 25524.
//
// Rulings:
//   [2009-10-01] The ability triggers when Angelic Protector is chosen as a target for a spell or
//     ability. The Protectors ability will be put on the stack above that spell or ability, and so
//     resolve first.

const TEXT = "Whenever this creature becomes the target of a spell or ability, this creature gets +0/+3 until end of turn.";

export default defineCard({
  name: "Angelic Protector",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
