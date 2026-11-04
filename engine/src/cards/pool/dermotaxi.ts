import { defineCard } from "../define.js";

const ENTER_TEXT = "Imprint — As this Vehicle enters, exile a creature card from a graveyard.";
const COPY_TEXT =
  "Tap two untapped creatures you control: Until end of turn, this Vehicle becomes a copy of the exiled card, except it's a Vehicle artifact in addition to its other types.";

export default defineCard({
  name: "Dermotaxi",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { exile: { filter: { type: "creature" }, count: 1, anyGraveyard: true } },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "stay",
        leftover: "stay",
        then: {
          kind: "become-copy",
          target: "source",
          of: 0,
          ofCard: true,
          until: "end-of-turn",
          exceptions: { addTypes: ["artifact"], addSubtypes: ["Vehicle"] },
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
