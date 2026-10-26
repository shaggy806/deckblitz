import { defineCard } from "../define.js";

export default defineCard({
  name: "Disturbing Plot",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  conspire: true,
  text: "Return target creature card from a graveyard to its owner's hand.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
