import { defineCard } from "../define.js";

// Gollum, Silent Slinker's Adventure. The creature slot is "up to one" (it
// may be left empty); the player slot is required, so with no creature chosen
// the spell still resolves for the life gain.

export default defineCard({
  name: "Meager Meal",
  art: "https://cards.scryfall.io/art_crop/back/6/c/6cfaa182-3fec-4907-8814-b4d29c33cec3.jpg",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Put a +1/+1 counter on up to one target creature. Target player gains 2 life. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "optional", of: "creature" }, "player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "gain-life", amount: 2, toControllerOfTarget: 1 },
    ],
  },
  faces: ["Gollum, Silent Slinker", "Meager Meal"],
  adventure: true,
});
