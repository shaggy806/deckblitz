import { defineCard } from "../define.js";

// EDHREC rank 26488.
//
// Rulings:
//   [2008-10-01] This ability has no duration. The affected creature will have banding, first
//     strike, or trample until the game ends, it leaves the battlefield, or some other effect
//     causes it to lose its abilities.

export default defineCard({
  name: "Nature's Blessing",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  text: "{G}{W}, Discard a card: Put a +1/+1 counter on target creature or that creature gains banding, first strike, or trample. (This effect lasts indefinitely. Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding a player controls are blocking or being blocked by a creature, that player divides that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)",
  activated: [
    {
      cost: { mana: "{G}{W}", tap: false, discard: { count: 1 } },
      targets: ["creature"],
      // Which one is chosen as it resolves; "this effect lasts
      // indefinitely" — no duration.
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Put a +1/+1 counter on it", effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 } },
          { text: "It gains banding", effect: { kind: "grant-keyword", target: 0, keyword: "banding", duration: "permanent" } },
          { text: "It gains first strike", effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "permanent" } },
          { text: "It gains trample", effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "permanent" } },
        ],
      },
      resolve: null,
      text: "{G}{W}, Discard a card: Put a +1/+1 counter on target creature or that creature gains banding, first strike, or trample.",
    },
  ],
});
