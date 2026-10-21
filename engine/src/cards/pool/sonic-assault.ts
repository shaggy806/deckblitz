import { defineCard } from "../define.js";

// EDHREC rank 23438.
//
// A tapped creature can still be the target: it isn't tapped again, but its
// controller is still dealt 2 (the ruling). Jump-start is the
// discard-a-card flashback (Radical Idea).

export default defineCard({
  name: "Sonic Assault",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  flashback: { cost: "{1}{U}{R}", discard: 1, keyword: "jump-start" },
  text: "Tap target creature. Sonic Assault deals 2 damage to that creature's controller.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
