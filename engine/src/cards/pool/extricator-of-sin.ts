import { defineCard } from "../define.js";

// EDHREC rank 24274.
//
// One permanent at most, so one token at most (its ruling) — Vraska, Golgari
// Queen's "you may sacrifice another permanent. If you do".

const ENTER_TEXT =
  "When this creature enters, you may sacrifice another permanent. If you do, create a 3/2 colorless Eldrazi Horror creature token.";
const DELIRIUM_TEXT =
  "Delirium — At the beginning of your upkeep, if there are four or more card types among cards in your graveyard, transform this creature.";

export default defineCard({
  name: "Extricator of Sin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 3,
  text: `${ENTER_TEXT}\n${DELIRIUM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice another permanent to create a 3/2 Eldrazi Horror?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: {}, count: 1, exceptSource: true },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
              then: { kind: "create-token", token: "Eldrazi Horror Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: DELIRIUM_TEXT,
    },
  ],
  faces: ["Extricator of Sin", "Extricator of Flesh"],
  transform: true,
});
