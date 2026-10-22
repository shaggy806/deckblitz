import { defineCard } from "../define.js";

// EDHREC rank 20033. Huatli's Final Strike's one-sided fight.
//
// Rulings:
//   If the creature you control leaves the battlefield before Ambuscade
//   resolves, Ambuscade has no effect and no damage is dealt. If the creature
//   an opponent controls leaves the battlefield instead, the creature you
//   control gets +1/+0 even though it won't deal any damage.

export default defineCard({
  name: "Ambuscade",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 until end of turn. It deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
