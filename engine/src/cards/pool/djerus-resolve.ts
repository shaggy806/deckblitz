import { defineCard } from "../define.js";

// EDHREC rank 13838. Amonkhet. An untapped creature is a legal target too, and
// the prevention still applies (the ruling); untapping an attacker doesn't
// remove it from combat.

export default defineCard({
  name: "Djeru's Resolve",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Untap target creature. Prevent all damage that would be dealt to it this turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "prevent-damage", target: 0, amount: "all" },
    ],
  },
});
