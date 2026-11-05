import { defineCard } from "../define.js";


export default defineCard({
  name: "Do or Die",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Separate all creatures target player controls into two piles. Destroy all creatures in the pile of that player's choice. They can't be regenerated.",
  targets: ["player"],
  effect: {
    kind: "separate-into-piles",
    objects: { permanents: { type: "creature" }, whose: { target: 0 } },
    chooser: { target: 0 },
    chosen: { effect: { kind: "destroy", target: 0, cantBeRegenerated: true } },
  },
});
