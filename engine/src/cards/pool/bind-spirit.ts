import { defineCard } from "../define.js";

// Ghost Lantern's Adventure.
export default defineCard({
  name: "Bind Spirit",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Return target creature card from your graveyard to your hand. (Then exile this card. You may cast the artifact later from exile.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  faces: ["Ghost Lantern", "Bind Spirit"],
  adventure: true,
});
