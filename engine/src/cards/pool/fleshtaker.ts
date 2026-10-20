import { defineCard } from "../define.js";

// EDHREC rank 9999.

const SAC_TEXT = "Whenever you sacrifice another creature, you gain 1 life and scry 1.";

export default defineCard({
  name: "Fleshtaker",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 2,
  text: `${SAC_TEXT} (Look at the top card of your library. You may put that card on the bottom.)\n{1}, Sacrifice another creature: This creature gets +2/+2 until end of turn.`,
  triggered: [
    {
      resolve: null,
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      text: SAC_TEXT,
    },
  ],
  activated: [
    {
      resolve: null,
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      text: "{1}, Sacrifice another creature: This creature gets +2/+2 until end of turn.",
    },
  ],
});
