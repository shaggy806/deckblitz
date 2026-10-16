import { defineCard } from "../define.js";

// EDHREC rank 12959.
//
// Archmage of Echoes' copy trigger, narrowed to creature spells (the ruling:
// a noncreature Kindred spell of those types isn't copied). `subtypes` is an
// any-of list.

const COPY_TEXT = "Whenever you cast a Pegasus, Unicorn, or Horse creature spell, copy it.";
const ANTHEM_TEXT = "Other Pegasi, Unicorns, and Horses you control get +1/+1.";

export default defineCard({
  name: "Thurid, Mare of Destiny",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${COPY_TEXT} (The copy becomes a token.)\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "creature", subtypes: ["Pegasus", "Unicorn", "Horse"] },
      },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell" },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { subtypes: ["Pegasus", "Unicorn", "Horse"], controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
