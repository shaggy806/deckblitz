import { defineCard } from "../define.js";

// EDHREC rank 22011.
// Knockout Maneuver's counter-then-bite: the damage is the creature's power
// as it deals it, the new counter included.

export default defineCard({
  name: "Colossal Collision",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Put a +1/+1 counter on target creature you control. Then that creature deals damage equal to its power to target creature an opponent controls.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
