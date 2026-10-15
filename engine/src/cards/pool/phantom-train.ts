import { defineCard } from "../define.js";

// EDHREC rank 11987. Dreadmobile's "sacrifice another artifact or creature"
// cost; the counter stays, the animation lasts the turn (Restless Fortress's
// `add-types` with a creature type added).
const TEXT =
  "Sacrifice another artifact or creature: Put a +1/+1 counter on this Vehicle. It becomes a Spirit artifact creature in addition to its other types until end of turn.";

export default defineCard({
  name: "Phantom Train",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "add-types",
            target: "source",
            addTypes: ["artifact", "creature"],
            addSubtypes: ["Spirit"],
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
      otherOnly: true,
    },
  ],
});
