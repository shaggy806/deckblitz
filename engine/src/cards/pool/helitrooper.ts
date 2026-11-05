import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever this creature attacks, another target attacking creature gains flying until end of turn.";
const EQUIP_TEXT = "Equip abilities you activate that target this creature cost {2} less to activate.";

export default defineCard({
  name: "Helitrooper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${EQUIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, targetingSource: true, reduceGeneric: 2 },
      text: EQUIP_TEXT,
    },
  ],
});
