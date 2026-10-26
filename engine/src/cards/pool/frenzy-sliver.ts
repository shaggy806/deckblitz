import { defineCard } from "../define.js";

// Frenzy 1 isn't an engine keyword: it's the trigger it stands for, granted
// to every Sliver creature, whoever controls it (Virulent Sliver's scope).
export default defineCard({
  name: "Frenzy Sliver",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: "All Sliver creatures have frenzy 1. (Whenever a Sliver attacks and isn't blocked, it gets +1/+0 until end of turn.)",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsTriggered: [
        {
          trigger: { on: "attacks-unblocked", who: "self" },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: "Frenzy 1",
        },
      ],
      text: "All Sliver creatures have frenzy 1.",
    },
  ],
});
