import { defineCard } from "../define.js";

// The back face of Invasion of Segovia (invasion-of-segovia.ts).
const CONVOKE =
  "Noncreature spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting a noncreature spell pays for {1} or one mana of that creature's color.)";
const UNTAP = "At the beginning of your end step, untap up to four target creatures.";

export default defineCard({
  name: "Caetus, Sea Tyrant of Segovia",
  art: "https://cards.scryfall.io/art_crop/back/9/d/9df3e743-7bb8-482a-afd1-4d51119d416c.jpg",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 3,
  toughness: 3,
  text: `${CONVOKE}\n${UNTAP}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { notTypes: ["creature"] }, convoke: true },
      text: CONVOKE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "any-number", max: 4, of: "creature" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 } },
      resolve: null,
      text: UNTAP,
    },
  ],
  faces: ["Invasion of Segovia", "Caetus, Sea Tyrant of Segovia"],
  transform: true,
});
