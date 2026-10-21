import { defineCard } from "../define.js";

// Silverflame Squire's Adventure. Refuse to Yield's pump-and-untap: an
// untapped creature can be targeted, and still gets +2/+2 (the ruling).

export default defineCard({
  name: "On Alert",
  art: "https://cards.scryfall.io/art_crop/back/7/b/7bd105f3-fa33-4490-aea9-b47ca121b664.jpg",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Target creature gets +2/+2 until end of turn. Untap it. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
  faces: ["Silverflame Squire", "On Alert"],
  adventure: true,
});
