import { defineCard } from "../define.js";

// Ishgard, the Holy See's Adventure.
const CARD = { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "enchantment"] } } as const;

export default defineCard({
  name: "Faith & Grief",
  art: "https://cards.scryfall.io/art_crop/back/0/6/068bc755-9d3d-430b-abc5-c775a5415bf9.jpg",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Return up to two target artifact and/or enchantment cards from your graveyard to your hand. (Then exile this card. You may play the land later from exile.)",
  targets: [{ kind: "any-number", of: CARD, max: 2 }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0, from: "graveyard" } },
});
