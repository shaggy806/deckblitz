import { defineCard } from "../define.js";

const TEXT = "When Red Guardian enters, destroy target creature an opponent controls that dealt damage this turn.";

export default defineCard({
  name: "Red Guardian, Super-Soldier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier", "Villain"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", dealtDamageThisTurn: true } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
