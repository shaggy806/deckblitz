import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 32228.

const WEAVE = "{2}: Target green or blue creature gets +0/+1 until end of turn.";

export default defineCard({
  name: "Spirit Weaver",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: WEAVE,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["U"] }] } },
      ],
      effect: { kind: "modify-pt", target: 0, power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: WEAVE,
    },
  ],
});
