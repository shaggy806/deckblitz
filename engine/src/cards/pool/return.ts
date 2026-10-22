import { defineCard } from "../define.js";

// The aftermath half of Never // Return: cast only from a graveyard, then
// exiled (rule 702.127a). Any card, in any graveyard (Vile Rebirth's shape
// without its creature filter).
const FACES = ["Never // Return", "Never", "Return"];

export default defineCard({
  name: "Return",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nExile target card from a graveyard. Create a 2/2 black Zombie creature token.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Zombie Token", count: 1 },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
