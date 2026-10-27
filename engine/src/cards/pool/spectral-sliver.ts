import { defineCard } from "../define.js";

export default defineCard({
  name: "Spectral Sliver",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver", "Spirit"],
  power: 2,
  toughness: 2,
  text: "All Sliver creatures have \"{2}: This creature gets +1/+1 until end of turn.\"",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: "{2}: This creature gets +1/+1 until end of turn.",
        },
      ],
      text: "All Sliver creatures have \"{2}: This creature gets +1/+1 until end of turn.\"",
    },
  ],
});
