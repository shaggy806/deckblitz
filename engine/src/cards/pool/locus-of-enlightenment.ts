import { defineCard } from "../define.js";

// Rulings:
//   Locus of Enlightenment has only the activated abilities of the exiled cards used to craft it.
//   The "only once each turn" restriction applies to each ability individually.
//   The copy is created on the stack, so it's not "activated."

const HAS_TEXT =
  "Locus of Enlightenment has each activated ability of the exiled cards used to craft it. You may activate each of those abilities only once each turn.";
const COPY_TEXT =
  "Whenever you activate an ability that isn't a mana ability, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Locus of Enlightenment",
  art: "https://cards.scryfall.io/art_crop/back/2/e/2e98970d-06a8-4c91-ba47-4a02c5b949f2.jpg",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${HAS_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      // The craft materials stay linked to the permanent it became (rule 702.167c).
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "exiled-with", filter: {}, onceEach: true },
      text: HAS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you" },
      targets: [],
      effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  faces: ["The Enigma Jewel", "Locus of Enlightenment"],
  transform: true,
});
