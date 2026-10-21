import { defineCard } from "../define.js";

// An indestructible target survives the destroy and is still dealt the 1
// damage if an opponent controls it; an illegal target means nothing happens
// (the rulings).
export default defineCard({
  name: "Sagittars' Volley",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target creature with flying. Sagittars' Volley deals 1 damage to each creature with flying your opponents control.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "damage-all",
        filter: { type: "creature", keyword: "flying", controlledBy: "opponent" },
        amount: 1,
      },
    ],
  },
});
