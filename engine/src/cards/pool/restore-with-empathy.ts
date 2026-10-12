import { defineCard } from "../define.js";

export default defineCard({
  name: "Restore with Empathy",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Return target permanent card from your graveyard to your hand. You gain 4 life.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "gain-life", amount: 4 },
    ],
  },
});
