import { defineCard } from "../define.js";

// EDHREC rank 10285.
//
// Rulings:
//   [2025-02-07] If an ability triggers whenever you activate an exhaust ability, that ability
//     resolves before the exhaust ability resolves.
//   [2025-02-07] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.
//   [2025-02-07] Exhaust abilities can be activated any time you could normally activate an
//     ability.

const EXHAUST_TEXT =
  "Exhaust — {X}{U}{U}, {T}: Draw X cards. Put a +1/+1 counter on each Merfolk creature you control.";

export default defineCard({
  name: "Mindspring Merfolk",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  activated: [
    {
      cost: { mana: "{X}{U}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: "x" },
          {
            kind: "add-counter-all",
            filter: { type: "creature", subtype: "Merfolk", controlledBy: "you" },
            counter: "+1/+1",
            amount: 1,
          },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
  ],
});
