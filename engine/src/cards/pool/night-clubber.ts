import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, creatures your opponents control get -1/-1 until end of turn.";
const BLITZ_TEXT =
  'Blitz {2}{B} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Night Clubber",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{2}{B}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
