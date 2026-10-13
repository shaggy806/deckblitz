import { defineCard } from "../define.js";

// EDHREC rank 13289.
//
// Rulings:
//   [2025-02-07] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.
//   [2025-02-07] Exhaust abilities can be activated any time you could normally activate an
//     ability.
//   [2025-02-07] If an ability triggers whenever you activate an exhaust ability, that ability
//     resolves before the exhaust ability resolves.
//
// The exhaust is Invasion Submersible's: an artifact creature for as long as
// it stays on the battlefield, no crew needed.

const TREASURE_TEXT = "Whenever this Vehicle attacks, create a Treasure token.";
const EXHAUST_TEXT = "Exhaust — {3}: This Vehicle becomes an artifact creature. Put a +1/+1 counter on it.";

export default defineCard({
  name: "Rocketeer Boostbuggy",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  text: `${TREASURE_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)\nCrew 1`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "permanent" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
