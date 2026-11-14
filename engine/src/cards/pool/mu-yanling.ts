import { defineCard } from "../define.js";

// EDHREC rank 15565.
export default defineCard({
  name: "Mu Yanling",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Yanling"],
  loyalty: 5,
  text: "+2: Target creature can't be blocked this turn.\n−3: Draw two cards.\n−10: Tap all creatures your opponents control. You take an extra turn after this one.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "+2: Target creature can't be blocked this turn.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "−3: Draw two cards.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
          { kind: "take-extra-turn" },
        ],
      },
      resolve: null,
      text: "−10: Tap all creatures your opponents control. You take an extra turn after this one.",
    },
  ],
});
