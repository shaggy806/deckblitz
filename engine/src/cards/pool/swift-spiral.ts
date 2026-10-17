import { defineCard } from "../define.js";

// Twining Twins's Adventure. Touch the Spirit Realm's delayed flicker.
const TEXT =
  "Exile target nontoken creature. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Swift Spiral",
  art: "https://cards.scryfall.io/art_crop/back/0/4/043718ea-59f6-4d1a-94c5-271704c1a38a.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { token: false, type: "creature" } }],
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    returnText: "Return the exiled card to the battlefield under its owner's control.",
  },
  faces: ["Twining Twins", "Swift Spiral"],
  adventure: true,
});
