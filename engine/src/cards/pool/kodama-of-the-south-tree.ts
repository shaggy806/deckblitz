import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 19311. The Spirit or Arcane cast
// trigger (Sire of the Storm's) with Overrun's two group effects, each
// sparing the Kodama itself ("each other creature you control"); the
// creatures affected are fixed as it resolves (rule 611.2c).

const TEXT =
  "Whenever you cast a Spirit or Arcane spell, each other creature you control gets +1/+1 and gains trample until end of turn.";

export default defineCard({
  name: "Kodama of the South Tree",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
            exceptSource: true,
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
