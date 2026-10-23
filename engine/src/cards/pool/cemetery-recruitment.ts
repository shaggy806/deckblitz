import { defineCard } from "../define.js";

export default defineCard({
  name: "Cemetery Recruitment",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to your hand. If it's a Zombie card, draw a card.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Zombie" } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
