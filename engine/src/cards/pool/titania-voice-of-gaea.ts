import { defineCard } from "../define.js";

const LIFE_TEXT = "Whenever one or more land cards are put into your graveyard from anywhere, you gain 2 life.";
const MELD_TEXT =
  "At the beginning of your upkeep, if there are four or more land cards in your graveyard and you both own and control Titania, Voice of Gaea and a land named Argoth, Sanctum of Nature, exile them, then meld them into Titania, Gaea Incarnate.";
const ARGOTH = { name: "Argoth, Sanctum of Nature", type: "land" } as const;

export default defineCard({
  name: "Titania, Voice of Gaea",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  meldCard: true,
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${LIFE_TEXT}\n${MELD_TEXT}`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "land" }, batched: true },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: LIFE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "cards-in-graveyard", atLeast: 4, filter: { type: "land" } },
          { kind: "meld-ready", partner: ARGOTH },
        ],
      },
      targets: [],
      effect: { kind: "meld", partner: ARGOTH, into: "Titania, Gaea Incarnate" },
      resolve: null,
      text: MELD_TEXT,
    },
  ],
});
