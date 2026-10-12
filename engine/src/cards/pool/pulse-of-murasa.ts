import { defineCard } from "../define.js";

export default defineCard({
  name: "Pulse of Murasa",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Return target creature or land card from a graveyard to its owner's hand. You gain 6 life.",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { typesAnyOf: ["creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "gain-life", amount: 6 },
    ],
  },
});
