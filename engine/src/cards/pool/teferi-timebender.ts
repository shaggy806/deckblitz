import { defineCard } from "../define.js";

// EDHREC rank 16977.

export default defineCard({
  name: "Teferi, Timebender",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 5,
  text: "+2: Untap up to one target artifact or creature.\n−3: You gain 2 life and draw two cards.\n−9: Take an extra turn after this one.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "artifact-or-creature" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "+2: Untap up to one target artifact or creature.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: "−3: You gain 2 life and draw two cards.",
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: "−9: Take an extra turn after this one.",
    },
  ],
});
