import { defineCard } from "../define.js";

// The hand is shown to every player and stays where it is (rule 701.20a):
// nothing follows it.
const TEXT = "{U}{B}, {T}: Target player loses 1 life and reveals their hand.";

export default defineCard({
  name: "Thoughtcutter Agent",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}{B}", tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "reveal-hand", who: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
