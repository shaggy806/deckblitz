import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 27414.

const ENTER_TEXT =
  "When U.S.S. Defiant enters, it and up to one target creature you control phase out. (Treat them and anything " +
  "attached to them as though they don't exist until your next turn.)";

export default defineCard({
  name: "U.S.S. Defiant, Mirror Migrant",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\nStation\n8+ | Flying`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "phase-out", target: "source" },
          { kind: "phase-out", target: 0 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [station("Station")],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["flying"],
      text: "8+ | Flying",
    }),
  ],
});
