import { defineCard } from "../define.js";

export default defineCard({
  name: "Satyr's Cunning",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create a 1/1 red Satyr creature token with \"This token can't block.\"\nEscape—{2}{R}, Exile two other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  escape: { cost: "{2}{R}", exileCount: 2 },
  effect: { kind: "create-token", token: "Satyr Token", count: 1 },
});
