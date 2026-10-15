import { defineCard } from "../define.js";

// EDHREC rank 16009.
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
//
// "If you discard a land card this way, put it from your graveyard onto the
// battlefield tapped" reads the card the discard put there (`thisWay:
// "discarded"`), and only in the graveyard: one a replacement sent elsewhere
// isn't found. The landfall ability returns this card from the graveyard, so
// it works only there (rule 113.6k — Bloodghast, Spit Flame).

const ENTERS_TEXT =
  "When this creature enters, draw a card, then discard a card. If you discard a land card this way, put it from your graveyard onto the battlefield tapped.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may pay {1}{G}{U}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Silvan Reveler",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Citizen"],
  power: 3,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "return-from-graveyard",
            filter: { thisWay: "discarded", type: "land" },
            destination: "battlefield",
            count: "all",
            enterTapped: true,
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{G}{U} to return Silvan Reveler to your hand?",
        cost: "{1}{G}{U}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
