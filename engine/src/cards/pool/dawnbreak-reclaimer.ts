import { defineCard } from "../define.js";

// EDHREC rank 12632. Commander 2015.
// Rulings:
//   If any opponent has a creature card in their graveyard as the ability
//   resolves, you must choose one of those cards — you can't choose an
//   opponent with none to avoid it.
//   With no creature card in any opponent's graveyard, you choose which
//   opponent chooses a creature card in your graveyard, and may still return
//   it.
//
// Each card is only chosen where it is (`destination: "stay"`, "chosen this
// way"); "that player" is the chosen card's owner. The one "you may" covers
// both cards, returned together under their owners' control.

const TEXT =
  "At the beginning of your end step, choose a creature card in an opponent's graveyard, then that player chooses a creature card in your graveyard. You may return those cards to the battlefield under their owners' control.";
const CHOOSE_THEIRS =
  "Choose a creature card in an opponent's graveyard — then they choose one in yours, and you may return both under their owners' control";
const CHOOSE_MINE =
  "Choose a creature card in Dawnbreak Reclaimer's controller's graveyard — they may return the chosen cards to the battlefield under their owners' control";

export default defineCard({
  name: "Dawnbreak Reclaimer",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "graveyards",
            filter: { type: "creature", ownedBy: "opponent" },
            min: 1,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt: CHOOSE_THEIRS,
            then: {
              kind: "look-and-choose",
              zone: "graveyard",
              chooser: { ownerOf: 0 },
              filter: { type: "creature" },
              min: 1,
              max: 1,
              destination: "stay",
              leftover: "stay",
              prompt: CHOOSE_MINE,
            },
          },
          {
            kind: "conditional",
            // Which opponent chooses matters only with a creature card of
            // yours there to choose.
            condition: {
              kind: "all",
              of: [
                { kind: "not", of: { kind: "this-way", what: "chosen" } },
                { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "creature" } },
              ],
            },
            then: {
              kind: "choose-opponent",
              then: {
                kind: "look-and-choose",
                zone: "graveyard",
                chooser: "that-player",
                filter: { type: "creature" },
                min: 1,
                max: 1,
                destination: "stay",
                leftover: "stay",
                prompt: CHOOSE_MINE,
              },
            },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "chosen" },
            then: {
              kind: "may",
              prompt: "Return the chosen cards to the battlefield under their owners' control?",
              effect: {
                kind: "return-from-graveyard",
                from: "each-graveyard",
                filter: { thisWay: "chosen" },
                count: "all",
                destination: "battlefield",
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
