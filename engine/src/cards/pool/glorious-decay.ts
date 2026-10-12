import { defineCard } from "../define.js";

export default defineCard({
  name: "Glorious Decay",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target artifact.\n• Glorious Decay deals 4 damage to target creature with flying.\n• Exile target card from a graveyard. Draw a card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Glorious Decay deals 4 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Exile target card from a graveyard. Draw a card.",
        targets: [{ kind: "card-in-graveyard", whose: "any" }],
        effect: {
          kind: "sequence",
          effects: [{ kind: "exile", target: 0 }, { kind: "draw", amount: 1 }],
        },
      },
    ],
  },
});
