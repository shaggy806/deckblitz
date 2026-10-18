import { defineCard } from "../define.js";

// Slick Imitator's "copy target spell you control. You may choose new targets
// for the copy."

const COPY_TEXT =
  "{1}, {T}, Sacrifice this artifact: Copy target spell you control. You may choose new targets for the copy.";

export default defineCard({
  name: "Overloaded Mage-Ring",
  art: "https://cards.scryfall.io/art_crop/back/c/0/c0ef6737-8e85-42ca-8ee6-6a34f9462de3.jpg",
  colors: ["U"],
  types: ["artifact"],
  text: `${COPY_TEXT} (A copy of a permanent spell becomes a token.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [{ kind: "spell", whose: "you", filter: {} }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  faces: ["Invasion of Vryn", "Overloaded Mage-Ring"],
  transform: true,
});
