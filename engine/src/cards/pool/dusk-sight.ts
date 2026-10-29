import { defineCard } from "../define.js";

export default defineCard({
  name: "Dusk Sight",
  art: "https://cards.scryfall.io/art_crop/back/a/1/a147b94f-dfcf-44ce-8a73-b2fe6c4efc0e.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Omen"],
  text: "Put a +1/+1 counter on up to one target creature. Draw a card. (Then shuffle this card into its owner's library.)",
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
  faces: ["Feral Deathgorger", "Dusk Sight"],
  omen: true,
});
