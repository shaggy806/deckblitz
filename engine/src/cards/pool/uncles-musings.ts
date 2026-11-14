import { defineCard } from "../define.js";

// EDHREC rank 17978. Converge: X is the colours of mana spent to cast it; its
// caster returns up to X permanent cards (anything but an instant or a
// sorcery), then the spell exiles itself.
export default defineCard({
  name: "Uncle's Musings",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Converge — Return up to X permanent cards from your graveyard to your hand, where X is the number of colors of mana spent to cast this spell.\nExile Uncle's Musings.",
  effect: {
    kind: "return-from-graveyard",
    filter: { notTypes: ["instant", "sorcery"] },
    destination: "hand",
    count: { manaSpentOf: "source", count: "colors" },
    upTo: true,
  },
  exileOnResolve: true,
});
