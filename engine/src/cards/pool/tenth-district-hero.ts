import { defineCard } from "../define.js";

// EDHREC rank 19392. Neither ability has a duration (its ruling): each lasts
// until the Hero leaves or something later changes it. "Becomes a Human
// Detective" replaces its creature types (rule 205.1b); the second ability
// keeps them and only adds the supertype, the name, the base P/T and the
// granted static, all through one `become` (`addSupertypes`, `name`, `static`).
// The Detective check is made as the second ability resolves (its ruling).
//
// Rulings:
//   If you can't exile enough cards to meet or exceed the required mana value, you can't choose
//     to collect evidence at all.
//   You can activate Tenth District Hero's second ability regardless of what creature types it
//     is. The ability checks Tenth District Hero's creature types when it resolves. If Tenth
//     District Hero isn't a Detective at that time, the ability does nothing.
//   Tenth District Hero's second ability checks whether it's a Detective. It doesn't matter how
//     it became a Detective.

const DETECTIVE_TEXT =
  "{1}{W}, Collect evidence 2: This creature becomes a Human Detective with base power and toughness 4/4 and gains vigilance.";
const MILEVA_TEXT =
  '{2}{W}, Collect evidence 4: If this creature is a Detective, it becomes a legendary creature named Mileva, the Stalwart, it has base power and toughness 5/5, and it gains "Other creatures you control have indestructible."';
const GRANTED_TEXT = "Other creatures you control have indestructible.";

export default defineCard({
  name: "Tenth District Hero",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  text: `${DETECTIVE_TEXT}\n${MILEVA_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, collectEvidence: 2 },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        power: 4,
        toughness: 4,
        setSubtypes: ["Human", "Detective"],
        keywords: ["vigilance"],
        duration: "permanent",
      },
      resolve: null,
      text: DETECTIVE_TEXT,
    },
    {
      cost: { mana: "{2}{W}", tap: false, collectEvidence: 4 },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { subtype: "Detective" } },
        then: {
          kind: "become",
          target: "source",
          addSupertypes: ["legendary"],
          name: "Mileva, the Stalwart",
          power: 5,
          toughness: 5,
          static: [
            {
              affects: { scope: "creatures-you-control", excludeSelf: true },
              grantKeywords: ["indestructible"],
              text: GRANTED_TEXT,
            },
          ],
          duration: "permanent",
        },
      },
      resolve: null,
      text: MILEVA_TEXT,
    },
  ],
});
