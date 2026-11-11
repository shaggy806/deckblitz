import { defineCard } from "../define.js";

// EDHREC rank 6941. One cost of two parts, paid in full or not at all: offered
// only while it's still there to sacrifice, the {3} as the "may", the
// sacrifice with it, and the rest only once both were done. The land is
// chosen as the ability resolves (never a target), and both cards found must
// have its name (the 2022-10-07 ruling) — a nonbasic land's name finds
// nothing, though the library is still searched and shuffled.

const FORM_TEXT = "Wraith Form — This creature can't be blocked.";
const SCOUT_TEXT =
  "Transdimensional Scout — When this creature deals combat damage to a player, you may pay {3} and sacrifice it. If you do, choose a land you control. Then search your library for up to two basic land cards which have the same name as the chosen land, put them onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Canoptek Wraith",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wraith"],
  power: 2,
  toughness: 1,
  text: `${FORM_TEXT}\n${SCOUT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: FORM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "may",
          prompt: "Pay {3} and sacrifice it to search for up to two basic lands?",
          cost: "{3}",
          effect: {
            kind: "sacrifice-source",
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "choose-permanents",
                  filter: { type: "land", controlledBy: "you" },
                  min: 1,
                  upTo: 1,
                  remember: true,
                  then: { kind: "sequence", effects: [] },
                  prompt: "Choose a land you control",
                },
                {
                  kind: "search-library",
                  filter: { type: "land", supertype: "basic", sameNameWith: { thisWay: "chosen" } },
                  destination: "battlefield",
                  enterTapped: true,
                  min: 0,
                  max: 2,
                },
              ],
            },
          },
        },
      },
      resolve: null,
      text: SCOUT_TEXT,
    },
  ],
});
