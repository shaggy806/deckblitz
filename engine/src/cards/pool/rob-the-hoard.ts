import { defineCard } from "../define.js";

// "Artifact, enchantment, or legendary card": a card type or the legendary supertype, either way.

export default defineCard({
  name: "Rob the Hoard",
  art: "https://cards.scryfall.io/art_crop/back/3/8/384ec8b7-472e-4026-9632-349ab9df2b27.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Return target artifact, enchantment, or legendary card from your graveyard to your hand. (Then exile this card. You may cast the creature later from exile.)",
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { anyOf: [{ typesAnyOf: ["artifact", "enchantment"] }, { supertype: "legendary" }] },
    },
  ],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  faces: ["Crystal Dragon", "Rob the Hoard"],
  adventure: true,
});
