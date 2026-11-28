import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 27841.
//
// Rulings:
//   You should always have one creature for your opponent to take (i.e. the Denizen). If by
//     chance you have no creature for your opponent to take, then they don't get one. Remember
//     that taking a creature is optional so your opponent is not forced to take the Denizen.
//   You must sacrifice the Swamps if you can. You can't choose not to pay if you have them.
//
// Rust Elemental's shape: the sacrifice is mandatory, as many as there are (rule 609.3), and
// "if you can't" is that fewer than two were sacrificed. You choose the opponent as it
// resolves (`choose-opponent`, Tasigur's ruling), and they choose — or decline — a creature you
// control (`choose-permanents` with that player as `chooser`), whose `then` is theirs: they
// gain control of it for as long as the Denizen remains on the battlefield.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice two Swamps. If you can't, tap this creature, and an opponent may gain control of a creature you control of their choice for as long as this creature remains on the battlefield.";
const TAP_TEXT = "{T}: Gain control of target creature for as long as this creature remains on the battlefield.";

export default defineCard({
  name: "Infernal Denizen",
  manaCost: "{7}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 7,
  text: `${UPKEEP_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "land", subtype: "Swamp" }, count: 2 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 1 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                {
                  kind: "choose-opponent",
                  then: {
                    kind: "choose-permanents",
                    chooser: "that-player",
                    filter: { type: "creature" },
                    controlledByPlayer: "you",
                    min: 0,
                    upTo: 1,
                    prompt: "You may gain control of a creature of your choice they control",
                    then: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
