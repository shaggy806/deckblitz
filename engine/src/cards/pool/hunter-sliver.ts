import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 13653.

export default defineCard({
  name: "Hunter Sliver",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: "All Sliver creatures have provoke. (Whenever a Sliver attacks, its controller may have target creature defending player controls untap and block it if able.)",
  static: [
    {
      // Every player's Slivers, as Sidewinder Sliver's flanking: each has the
      // trigger, so "it" is the Sliver that attacked.
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsTriggered: [provoke("Provoke")],
      text: "All Sliver creatures have provoke.",
    },
  ],
});
