import { defineCard } from "../define.js";

// Transforms into Avacyn, the Purifier. The delayed transform fires at the
// next upkeep, whoever's it is, and does nothing if Avacyn has transformed
// since it was set up (rule 701.28f — the ruling), as Aang's does.
const ENTER_TEXT = "When Archangel Avacyn enters, creatures you control gain indestructible until end of turn.";
const DIES_TEXT =
  "When a non-Angel creature you control dies, transform Archangel Avacyn at the beginning of the next upkeep.";

export default defineCard({
  name: "Archangel Avacyn",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flash", "flying", "vigilance"],
  text: `Flash\nFlying, vigilance\n${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", notSubtypes: ["Angel"] } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "transform", target: "source" },
        text: "Transform Archangel Avacyn.",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Archangel Avacyn", "Avacyn, the Purifier"],
  transform: true,
});
