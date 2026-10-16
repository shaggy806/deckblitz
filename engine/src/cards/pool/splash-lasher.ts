import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// EDHREC rank 8921. Bloomburrow.
//
// Offspring (rule 702.175) is the optional additional cost under its own
// keyword, and `offspringTrigger()` makes the 1/1 copy, whose own enters
// ability taps and stuns again (the ruling). The stun is Utrom Scientists'.
const STUN_TEXT =
  "When this creature enters, tap up to one target creature and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Splash Lasher",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog", "Wizard"],
  power: 3,
  toughness: 3,
  text: `Offspring {1}{U} (You may pay an additional {1}{U} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\n${STUN_TEXT}`,
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, tap up to one target creature and put a stun counter on it.",
    },
  ],
  kicker: { cost: "{1}{U}", keyword: "offspring" },
});
