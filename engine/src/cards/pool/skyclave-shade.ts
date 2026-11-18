import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't block.";
const KICKED_TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, if this card is in your graveyard and it's your turn, you may cast it from your graveyard this turn.";

// EDHREC rank 14679. The landfall ability says it works from the graveyard
// (rule 113.6b), and its intervening if is checked again on resolution (rule
// 603.4): a Shade that has left the graveyard since is a new object, and gets
// no permission. The permission lasts the turn, ending with any move (400.7).
export default defineCard({
  name: "Skyclave Shade",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 3,
  toughness: 1,
  kicker: { cost: "{2}{B}" },
  text: `Kicker {2}{B} (You may pay an additional {2}{B} as you cast this spell.)\n${BLOCK_TEXT}\n${KICKED_TEXT}\n${LANDFALL_TEXT}`,
  static: [
    { affects: { scope: "self" }, restrictions: ["cant-block"], text: BLOCK_TEXT },
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: KICKED_TEXT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      condition: {
        kind: "all",
        of: [{ kind: "source-zone", zones: ["graveyard"], sameObject: true }, { kind: "your-turn" }],
      },
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "grant-play", cards: "source", duration: "end-of-turn" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
