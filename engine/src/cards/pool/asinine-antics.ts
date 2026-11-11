import { defineCard } from "../define.js";

// EDHREC rank 8274. One Cursed Role for each creature your opponents control,
// each attached to its own, none targeted (hexproof doesn't stop it; a Role
// that can't attach isn't created — the rulings). The flash is the {2} more
// Rout's way.
export default defineCard({
  name: "Asinine Antics",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "You may cast this spell as though it had flash if you pay {2} more to cast it.\nFor each creature your opponents control, create a Cursed Role token attached to that creature. (If you control another Role on it, put that one into the graveyard. Enchanted creature is 1/1.)",
  targets: [],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", controlledBy: "opponent" },
    effect: { kind: "create-token", token: "Cursed Role Token", count: 1, attachedTo: 0 },
  },
  kicker: { cost: "{2}", keyword: "flash", flash: true },
});
