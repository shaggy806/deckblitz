import { defineCard } from "../define.js";

const ETB_TEXT = "When Syr Armont enters, create a Monster Role token attached to another target creature you control.";
const ANTHEM_TEXT = "Enchanted creatures you control get +1/+1.";

// "Enchanted" is any Aura on it, whoever controls the Aura (rule 303.4).
export default defineCard({
  name: "Syr Armont, the Redeemer",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  text: `${ETB_TEXT} (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1 and has trample.)\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
