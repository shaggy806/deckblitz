import { defineCard } from "../define.js";

// EDHREC rank 26600.
//
// Rulings:
//   [2025-02-07] If an ability triggers whenever you activate an exhaust ability, that ability
//     resolves before the exhaust ability resolves.
//   [2025-02-07] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.
//   [2025-02-07] Exhaust abilities can be activated any time you could normally activate an
//     ability.

const EXHAUST_TEXT = "Exhaust — {2}{R}: Put a +1/+1 counter on this creature. It gains double strike until end of turn.";

export default defineCard({
  name: "Pacesetter Paragon",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 3,
  text: `${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
  ],
});
