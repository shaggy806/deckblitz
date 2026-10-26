import { defineCard } from "../define.js";

export default defineCard({
  name: "Stir the Grave",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card with mana value X or less from your graveyard to the battlefield.",
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: "x" } } },
  ],
  effect: { kind: "put-onto-battlefield", target: 0 },
});
