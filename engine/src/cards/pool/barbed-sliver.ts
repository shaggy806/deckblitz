import { defineCard } from "../define.js";

export default defineCard({
  name: "Barbed Sliver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Sliver creatures have \"{2}: This creature gets +1/+0 until end of turn.\"",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: "{2}: This creature gets +1/+0 until end of turn.",
        },
      ],
      text: "All Sliver creatures have \"{2}: This creature gets +1/+0 until end of turn.\"",
    },
  ],
});
