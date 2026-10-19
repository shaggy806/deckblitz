import { defineCard } from "../define.js";

// Dread Linnorm's Adventure (`dread-linnorm.ts`). An untapped target still gets
// the counters and hexproof (its ruling): the untap is just a step that does
// nothing then.

export default defineCard({
  name: "Scale Deflection",
  art: "https://cards.scryfall.io/art_crop/back/1/7/174ee9e7-8040-4b53-8d0d-177ce924521c.jpg",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Put two +1/+1 counters on target creature and untap it. It gains hexproof until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
    ],
  },
  faces: ["Dread Linnorm", "Scale Deflection"],
  adventure: true,
});
