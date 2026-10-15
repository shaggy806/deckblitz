import { defineCard } from "../define.js";

// EDHREC rank 21570.
// "Alex Wilder or another creature you control" is every creature you
// control, Alex included. "If you cast it from anywhere other than your
// hand" reads how the creature entered (`castBy`, `castFrom` — rule 603.4's
// intervening if): every zone a spell can be cast from but the hand. How it
// entered can't change while it stays, so the check as the ability resolves
// is the same one. Escape is Bloodbraid Challenger's.

const ENTER_TEXT =
  "Whenever Alex Wilder or another creature you control enters, if you cast it from anywhere other than your hand, it gets +2/+0 and gains haste until end of turn.";

export default defineCard({
  name: "Alex Wilder, Runaway",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero", "Villain"],
  power: 1,
  toughness: 3,
  text: `${ENTER_TEXT}\nEscape—{2}{R}, Exile three other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)`,
  escape: { cost: "{2}{R}", exileCount: 3 },
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: {
          type: "creature",
          castBy: "you",
          anyOf: [{ castFrom: "graveyard" }, { castFrom: "exile" }, { castFrom: "library" }, { castFrom: "command" }],
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
