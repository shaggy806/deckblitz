import { defineCard } from "../define.js";

const EXPLORE_TEXT = "Whenever one or more Pirates you control deal damage to a player, Francisco explores.";

export default defineCard({
  name: "Francisco, Fowl Marauder",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Pirate"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  pairing: { kind: "partner" },
  text: `Flying\nFrancisco can't block.\n${EXPLORE_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "Francisco can't block.",
    },
  ],
  triggered: [
    {
      // Batched: once per player dealt damage in one damage event, however
      // many Pirates dealt it (the ruling); combat damage or not.
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Pirate" }, to: "player" },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: EXPLORE_TEXT,
    },
  ],
});
