import { defineCard } from "../define.js";

// EDHREC rank 7103.
//
// Rulings:
//   [2022-12-02] You must pay all costs and follow all timing rules for cards played from your
//     graveyard this way. For example, you may play a land this way only while the stack is empty
//     during one of your own main phases, and only if you haven't played a land yet this turn.
//
// Crucible of Worlds's land permission beside Kess's spell permission with an
// Insect filter (any Insect spell, a kindred one too). The dies trigger is
// Murderous Rider's bottom-of-library, then a mill: the mill happens even if
// the card has left the graveyard by then.
const GRAVEYARD_TEXT = "You may play lands and cast Insect spells from your graveyard.";
const DIES_TEXT =
  "Whenever another Insect you control dies, put it on the bottom of its owner's library, then mill two cards. (Put the top two cards of your library into your graveyard.)";
const PUMP_TEXT =
  "{1}{B/G}: Target Insect gets +1/+0 and gains deathtouch until end of turn. ({B/G} can be paid with either {B} or {G}.)";

export default defineCard({
  name: "Zask, Skittering Swarmlord",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 5,
  toughness: 5,
  text: `${GRAVEYARD_TEXT}\n${DIES_TEXT}\n${PUMP_TEXT}`,
  static: [
    { affects: { scope: "self" }, playFromGraveyard: { type: "land" }, text: GRAVEYARD_TEXT },
    { affects: { scope: "self" }, castFromGraveyard: { filter: { subtype: "Insect" } }, text: GRAVEYARD_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Insect" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-on-library", target: "trigger-object", position: "bottom" },
          { kind: "mill", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B/G}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Insect" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
