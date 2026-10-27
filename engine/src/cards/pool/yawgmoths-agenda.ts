import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 27179.
//
// Rulings:
//   [2004-10-04] The cards in your graveyard are not considered to be in your hand for any reason.
//     For example, you can't discard them.
//   [2004-10-04] It will exile itself if it is going to the graveyard from the battlefield.
//   [2004-10-04] You count spells that were cast this turn before this card enters. (The Invasion
//     FAQ is not correct on this point.)
//
// Moderation's one-spell lock (its cast-this-turn count includes spells cast
// before this entered, the third ruling); Crucible of Worlds's land permission
// beside an unfiltered graveyard-cast permission; Festival of Embers's
// graveyard replacement narrowed to cards (Leyline of the Void's `token:
// false`), which also exiles this card itself as it would go to the graveyard.
const ONE_TEXT = "You can't cast more than one spell each turn.";
const GRAVEYARD_TEXT = "You may play lands and cast spells from your graveyard.";
const EXILE_TEXT = "If a card would be put into your graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Yawgmoth's Agenda",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ONE_TEXT}\n${GRAVEYARD_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", atLeast: 1 },
      prohibits: { who: "you", spells: true },
      text: ONE_TEXT,
    },
    { affects: { scope: "self" }, playFromGraveyard: { type: "land" }, text: GRAVEYARD_TEXT },
    { affects: { scope: "self" }, castFromGraveyard: { filter: {} }, text: GRAVEYARD_TEXT },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you", token: false } },
      text: EXILE_TEXT,
    },
  ],
});
