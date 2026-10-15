import { defineCard } from "../define.js";

// EDHREC rank 2889. Excess damage (rule 120.4a): past lethal damage, damage
// already marked counted, 1 from a deathtouch source (the rulings).

export default defineCard({
  name: "Hell to Pay",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Hell to Pay deals X damage to target creature. Create a number of tapped Treasure tokens equal to the amount of excess damage dealt to that creature this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "create-token", token: "Treasure Token", count: { excessDamageThisWay: true, to: 0 }, tapped: true },
    ],
  },
});
