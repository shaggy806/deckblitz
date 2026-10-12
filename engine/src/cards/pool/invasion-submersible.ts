import { defineCard } from "../define.js";

// EDHREC rank 16383.
//
// Rulings:
//   [2025-10-02] Exhaust abilities can be activated any time you could normally activate an
//     ability.
//   [2025-10-02] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.
//
// A Vehicle with no crew: the exhaust ability makes it an artifact creature
// for as long as it stays (crew's `add-types`, with no end), its printed 0/0
// then its power and toughness (rule 301.7b) with the three counters on top.
// The Vehicle itself may tap to help pay the waterbend cost.

const ENTER_TEXT = "When this Vehicle enters, return up to one other target nonland permanent to its owner's hand.";
const BEND_TEXT =
  "Exhaust — Waterbend {3}: This Vehicle becomes an artifact creature. Put three +1/+1 counters on it.";

export default defineCard({
  name: "Invasion Submersible",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}. Activate each exhaust ability only once.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false, waterbend: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "permanent" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
        ],
      },
      resolve: null,
      text: BEND_TEXT,
      exhaust: true,
    },
  ],
});
