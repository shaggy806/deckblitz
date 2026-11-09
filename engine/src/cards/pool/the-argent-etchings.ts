import { defineCard } from "../define.js";

const I_TEXT = "I — Incubate 2 five times, then transform all Incubator tokens you control.";
const II_TEXT = "II — Creatures you control get +1/+1 and gain double strike until end of turn.";
const III_TEXT =
  "III — Destroy all other permanents except for artifacts, lands, and Phyrexians. Exile this Saga, then return it to the battlefield (front face up).";

export default defineCard({
  name: "The Argent Etchings",
  art: "https://cards.scryfall.io/art_crop/back/d/8/d8999135-ddb1-4e4c-b885-e25f23dac3d3.jpg",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  faces: ["Elesh Norn", "The Argent Etchings"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "repeat", times: 5, effect: { kind: "incubate", amount: 2 } },
          {
            kind: "for-each-permanent",
            filter: { subtype: "Incubator", token: true, controlledBy: "you" },
            simultaneous: true,
            effect: { kind: "transform", target: 0 },
          },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "double-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "destroy-all",
            filter: { notTypes: ["artifact", "land"], notSubtypes: ["Phyrexian"] },
            exceptSource: true,
          },
          { kind: "flicker", target: "source" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
