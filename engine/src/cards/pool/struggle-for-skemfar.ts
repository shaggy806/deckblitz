import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 20693.
//
// With the second target gone illegal, the counter still goes on and no fight happens; with
// the first gone, nothing happens to it (its rulings) — the per-slot legality the fight reads.
export default defineCard({
  name: "Struggle for Skemfar",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control. Then that creature fights up to one target creature you don't control. (Each deals damage equal to its power to the other.)\nForetell {G} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{G}" },
  targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
