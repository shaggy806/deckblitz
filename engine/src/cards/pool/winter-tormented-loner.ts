import { defineCard } from "../define.js";

// EDHREC rank 22078.

const ENTER_TEXT =
  "When Winter enters, you may sacrifice a creature or planeswalker. When you do, each opponent sacrifices a creature of their choice.";
const PUMP_TEXT = "Winter gets +1/+0 for each creature and planeswalker card in your graveyard.";

// "When you do" is a reflexive ability (rule 603.12, Cavalier of Night's
// shape). Not "another": Winter itself may be the sacrifice. A creature
// planeswalker card counts once (one card matching either type).
export default defineCard({
  name: "Winter, Tormented Loner",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 0,
  toughness: 3,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { typesAnyOf: ["creature", "planeswalker"] }, text: "Sacrifice a creature or planeswalker" },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
          text: "When you do, each opponent sacrifices a creature of their choice.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { typesAnyOf: ["creature", "planeswalker"], ownedBy: "you" }, pt: [1, 0] },
      text: PUMP_TEXT,
    },
  ],
});
