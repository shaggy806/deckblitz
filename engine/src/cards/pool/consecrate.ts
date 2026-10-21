import { defineCard } from "../define.js";

const FACES = ["Consecrate // Consume", "Consecrate", "Consume"];

// The left half of Consecrate // Consume (rule 709).
export default defineCard({
  name: "Consecrate",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Exile target card from a graveyard.\nDraw a card.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "draw", amount: 1 }] },
  faces: FACES,
  split: true,
});
