import { defineCard } from "../define.js";

// Nemesis (NEM). Fading 7 (rule 702.32) as its two pieces, Parallax Wave's shape.
// Each token remembers this enchantment (`linkedToSource`), and reads its fade
// counters: the ruling's "each token knows which Saproling Burst it came from".

const FADING = "Fading 7";
const FADING_UPKEEP =
  "(This enchantment enters with seven fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)";
const MAKE =
  'Remove a fade counter from this enchantment: Create a green Saproling creature token. It has "This token\'s power and toughness are each equal to the number of fade counters on Saproling Burst."';
const LEAVES =
  "When this enchantment leaves the battlefield, destroy all tokens created with this enchantment. They can't be regenerated.";

export default defineCard({
  name: "Saproling Burst",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${FADING} ${FADING_UPKEEP}\n${MAKE}\n${LEAVES}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 7 } },
      text: FADING,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token (Saproling Burst)", count: 1, linkedToSource: true },
      resolve: null,
      text: MAKE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FADING_UPKEEP,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { token: true, createdWithSource: true },
        cantBeRegenerated: true,
      },
      resolve: null,
      text: LEAVES,
    },
  ],
});
