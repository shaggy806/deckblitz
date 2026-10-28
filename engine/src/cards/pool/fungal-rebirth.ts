import { defineCard } from "../define.js";

export default defineCard({
  name: "Fungal Rebirth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Return target permanent card from your graveyard to your hand. If a creature died this turn, create two 1/1 green Saproling creature tokens.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      {
        kind: "conditional",
        condition: { kind: "creature-died-this-turn" },
        then: { kind: "create-token", token: "Saproling Token", count: 2 },
      },
    ],
  },
});
