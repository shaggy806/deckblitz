import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). Soulshift 3 (rule 702.46a) as the dies trigger
// it is (Midnight Scavengers' shape). This card's own mana value (4) keeps
// it from targeting itself.
const SOULSHIFT = "Soulshift 3";

export default defineCard({
  name: "Kami of Empty Graves",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 1,
  text: "Soulshift 3 (When this creature dies, you may return target Spirit card with mana value 3 or less from your graveyard to your hand.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Spirit", manaValue: { op: "lte", n: 3 } } }],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: SOULSHIFT,
    },
  ],
});
