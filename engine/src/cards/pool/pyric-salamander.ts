import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 32270.
//
// Attack-in-the-Box's delayed sacrifice: only this object (rule 400.7), so
// one that has left and come back by then isn't sacrificed. Each activation
// sets up its own delayed trigger.

const TEXT =
  "{R}: This creature gets +1/+0 until end of turn. Sacrifice this creature at the beginning of the next end step.";

export default defineCard({
  name: "Pyric Salamander",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Salamander"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "sacrifice-source" },
            text: "Sacrifice Pyric Salamander.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
