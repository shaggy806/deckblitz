import { defineCard } from "../define.js";

// EDHREC rank 18360.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Crush Dissent",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {2}.\nAmass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      { kind: "amass", amount: 2, creatureType: "Zombie" },
    ],
  },
});
