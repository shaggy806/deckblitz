import { defineCard } from "../define.js";

const LORD_TEXT = "Creatures you control get +1/+1.";
const ACTIVATED_TEXT = "{1}{W}{W}, {T}: Destroy target creature that dealt damage to you this turn.";

export default defineCard({
  name: "Spear of Heliod",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment", "artifact"],
  supertypes: ["legendary"],
  text: `${LORD_TEXT}\n${ACTIVATED_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}{W}", tap: true },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", dealtDamageThisTurn: { to: "you" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
