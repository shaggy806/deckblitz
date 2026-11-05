import { defineCard } from "../define.js";

export default defineCard({
  name: "Burglar's Plot",
  art: "https://cards.scryfall.io/art_crop/back/8/b/8bff0aa6-16d9-4c83-b598-ef00a3b33d2c.jpg",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Exchange control of two target nonland permanents that share a card type. (Then exile this card. You may cast the creature later from exile.)",
  targets: [
    "nonland-permanent",
    { kind: "other", of: "nonland-permanent", than: { slot: 0 }, shares: { kind: "card" } },
  ],
  effect: { kind: "exchange-control", objects: [0, 1] },
  faces: ["Bilbo, Luckwearer", "Burglar's Plot"],
  adventure: true,
});
