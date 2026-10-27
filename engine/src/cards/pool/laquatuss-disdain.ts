import { defineCard } from "../define.js";

// EDHREC rank 30926.
// `castFrom` reads the spell on the stack: any spell cast from a graveyard —
// flashback or any other permission (the ruling).

export default defineCard({
  name: "Laquatus's Disdain",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell cast from a graveyard.\nDraw a card.",
  targets: [{ kind: "spell", filter: { castFrom: "graveyard" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
