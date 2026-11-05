import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever this creature attacks, another target attacking Knight you control gets +1/+0 until end of turn.";
const EQUIP_TEXT = "Equip abilities you activate that target this creature cost {3} less to activate.";

export default defineCard({
  name: "Fervent Champion",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike", "haste"],
  text: `First strike, haste\n${ATTACK_TEXT}\n${EQUIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Knight", attacking: true } },
        },
      ],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, targetingSource: true, reduceGeneric: 3 },
      text: EQUIP_TEXT,
    },
  ],
});
