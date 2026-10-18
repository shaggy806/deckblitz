import { defineCard } from "../define.js";

// "Becomes a 4/4 Phyrexian Eye artifact creature" with no "loses its other
// types": `animate` adds creature and the creature types, keeps artifact
// (rule 205.1b), and sets its base P/T until end of turn.

const SCRY_TEXT = "When this artifact enters, scry 2.";
const ANIMATE_TEXT =
  "Whenever another artifact you control enters, this artifact becomes a 4/4 Phyrexian Eye artifact creature until end of turn.";

export default defineCard({
  name: "Eye of Malcator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${SCRY_TEXT} (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)\n${ANIMATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: SCRY_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "artifact" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Phyrexian", "Eye"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
