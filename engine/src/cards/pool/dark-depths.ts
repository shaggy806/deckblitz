import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 1477.
//
// Rulings:
//   Dark Depths doesn't have a mana ability. It doesn't tap for colorless mana.
//   The last ability of Dark Depths is a state trigger. It won't trigger again while the ability is
//     on the stack, but if the ability is countered and Dark Depths is still on the battlefield
//     with no ice counters on it, it will trigger again immediately.
//   If Dark Depths leaves the battlefield before its triggered ability resolves, you won't be able
//     to sacrifice it, so you won't create Marit Lage.

const ENTERS = "Dark Depths enters with ten ice counters on it.";
const REMOVE = "{3}: Remove an ice counter from Dark Depths.";
const NONE =
  "When Dark Depths has no ice counters on it, sacrifice it. If you do, create Marit Lage, a legendary 20/20 black Avatar creature token with flying and indestructible.";

export default defineCard({
  name: "Dark Depths",
  colors: [],
  supertypes: ["legendary", "snow"],
  types: ["land"],
  text: `${ENTERS}\n${REMOVE}\n${NONE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "ice", amount: 10 } },
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "ice", amount: 1 },
      resolve: null,
      text: REMOVE,
    },
  ],
  triggered: [
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "ice", compare: { op: "eq", n: 0 } } },
      targets: [],
      effect: { kind: "sacrifice-source", then: { kind: "create-token", token: "Marit Lage Token", count: 1 } },
      resolve: null,
      text: NONE,
    },
  ],
});
