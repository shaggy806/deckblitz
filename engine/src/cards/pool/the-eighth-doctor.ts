import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 12261. One allowance a turn, shared by the land and the spell
// (`oncePerTurn`), on its controller's own turns (`yourTurnOnly`), as Serra
// Paragon's. A historic card is an artifact, a legendary or a Saga (rule
// 700.6), judged as the face played; a historic land is one of those that's a
// land. What it let be played gains the replacement ability (rule 614) —
// the spell and the permanent it becomes, or the land as it enters
// (`gainsExileIfLeaves`), whether or not the Doctor is still there.
//
// Rulings:
//   [2023-10-13] If an effect instructs you to choose a creature type, you may choose Time Lord.
//   [2023-10-13] Neither "Time" nor "Lord" are creature types. Some older cards were printed with
//     the subtype "Lord," but all of those cards have updated Oracle card text that removed that
//     type.
//   [2023-10-13] Unlike other creature types in Magic that are each only one word, the two words
//     "Time Lord" represent a single creature subtype. Time Lord is the only two-word creature
//     type.

const HISTORIC: CardFilter = { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] };

const MILL_TEXT = "When The Eighth Doctor enters, mill three cards.";
const PLAY_TEXT =
  'Once during each of your turns, you may play a historic land or cast a historic permanent spell from your graveyard. If you do, it gains "If this permanent would leave the battlefield, exile it instead of putting it anywhere else."';

export default defineCard({
  name: "The Eighth Doctor",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 4,
  toughness: 4,
  text: `${MILL_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        play: true,
        filter: {
          ...HISTORIC,
          typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
        },
        oncePerTurn: true,
        yourTurnOnly: true,
        gainsExileIfLeaves: true,
      },
      text: PLAY_TEXT,
    },
  ],
});
