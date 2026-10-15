import { defineCard } from "../define.js";

// EDHREC rank 19978.
//
// Rulings:
//   [2026-06-29] A landfall ability triggers whenever a land you control enters for any reason. It
//     triggers whenever you play a land, as well as whenever a spell or ability puts a land onto
//     the battlefield under your control.
//   [2026-06-29] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.
//   [2026-06-29] Whenever a land you control enters, each landfall ability of permanents you
//     control will trigger. You can put them on the stack in any order. The last ability you put
//     on the stack will be the first one to resolve (as a result, you can have those abilities
//     resolve in the order of your choosing).

const ENTERS_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a permanent card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Boughside Wanderers",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 4,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { notTypes: ["instant", "sorcery"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
