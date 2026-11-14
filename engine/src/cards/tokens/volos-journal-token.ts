import { defineCard } from "../define.js";

// Volo, Itinerant Scholar's Volo's Journal token. "Note one of its creature
// types": only the spell's types, a changeling's every one, none already
// noted for this artifact (`choose-creature-type`'s `note` and
// `amongTypesOf`).

const NOTE_TEXT = "Whenever you cast a creature spell, note one of its creature types that hasn't been noted for this artifact.";

export default defineCard({
  name: "Volo's Journal Token",
  tokenName: "Volo's Journal",
  art: "7f0fe7c9-b0ab-4d48-94d0-99e7bee0c0de",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Book"],
  keywords: ["hexproof"],
  text: `Hexproof\n${NOTE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        note: true,
        amongTypesOf: "trigger-object",
        then: { kind: "sequence", effects: [] },
      },
      resolve: null,
      text: NOTE_TEXT,
    },
  ],
});
