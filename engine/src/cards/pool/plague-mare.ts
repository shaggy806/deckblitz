import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, creatures your opponents control get -1/-1 until end of turn.";

export default defineCard({
  name: "Plague Mare",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horse"],
  power: 2,
  toughness: 2,
  text: `This creature can't be blocked by white creatures.\n${ETB_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { colors: ["W"] },
      text: "This creature can't be blocked by white creatures.",
    },
  ],
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
      text: ETB_TEXT,
    },
  ],
});
