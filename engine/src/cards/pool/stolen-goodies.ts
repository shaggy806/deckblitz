import { defineCard } from "../define.js";

// It may be cast with no targets: then nothing is distributed, and it's
// still exiled on its Adventure (the ruling). The division is chosen as it's
// cast, at least one counter each.

export default defineCard({
  name: "Stolen Goodies",
  art: "https://cards.scryfall.io/art_crop/back/6/6/66485c3e-3b21-4db4-ac12-af04e35b49b1.jpg",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Distribute three +1/+1 counters among any number of target creatures you control. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "any-number", of: "creature-you-control", min: 0, max: 3 }],
  divided: { total: 3, slot: 0, of: "+1/+1 counters" },
  effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
  faces: ["Picnic Ruiner", "Stolen Goodies"],
  adventure: true,
});
