import { defineCard } from "../define.js";

// EDHREC rank 27238.

const END_TEXT =
  "At the beginning of your end step, create a 1/1 red Officer creature token for each dilemma you've faced this turn.";
const EXILE_TEXT =
  "{2}{W}{U}{B}{R}{G}, {T}: Exile the top five cards of your library. You may cast any number of spells with mana value less than or equal to the number of Officers you control from among those cards without paying their mana costs.";

// A dilemma is faced as you choose a modal spell's or ability's modes (the
// `dilemmas-faced` turn stat, one per choice). The Officers are counted as
// each spell is cast; the spells cast this way are on the stack, so the
// count doesn't move during the resolution.
export default defineCard({
  name: "Captain Benjamin Sisko",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 2,
  text: `${END_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Officer Token",
        count: { turnStat: "dilemmas-faced", who: "you" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}{U}{B}{R}{G}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 5 },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            free: true,
            repeat: true,
            spell: {
              manaValue: {
                op: "lte",
                n: { amount: { countOf: { type: "creature", subtype: "Officer", controlledBy: "you" } } },
              },
            },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
