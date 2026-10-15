import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "Exile an artifact or creature card from your graveyard: This Vehicle becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Earthrumbler",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 7,
  toughness: 6,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${ANIMATE_TEXT}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 1, filter: { typesAnyOf: ["artifact", "creature"] } } },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 3",
    },
  ],
});
