import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] You can activate Seasoned Hallowblade's ability even if nothing's about to
//     destroy it, even if it's already tapped, and even if it already has indestructible.

export default defineCard({
  name: "Seasoned Hallowblade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: "Discard a card: Tap this creature. It gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "source" },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Discard a card: Tap this creature. It gains indestructible until end of turn.",
    },
  ],
});
