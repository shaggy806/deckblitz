import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// "Two cards at random": two picks in a row, the second among what the first
// left, is the same draw as two picked at once (each pair equally likely).
// With one card there, the second pick finds nothing (the ruling).
const returnOneAtRandom: EffectSpec = {
  kind: "choose-random-card",
  zone: "graveyard",
  then: { kind: "return-to-hand", target: 0, from: "graveyard" },
};

export default defineCard({
  name: "Make a Wish",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return two cards at random from your graveyard to your hand.",
  targets: [],
  effect: { kind: "sequence", effects: [returnOneAtRandom, returnOneAtRandom] },
});
