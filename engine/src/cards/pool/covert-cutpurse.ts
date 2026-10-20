import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, destroy target creature you don't control that was dealt damage this turn.";

export default defineCard({
  name: "Covert Cutpurse",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  disturb: { cost: "{4}{B}" },
  text: `${ETB_TEXT}\nDisturb {4}{B} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  faces: ["Covert Cutpurse", "Covetous Geist"],
  transform: true,
});
