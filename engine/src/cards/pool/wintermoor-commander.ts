import { defineCard } from "../define.js";

const CDA_TEXT = "Wintermoor Commander's toughness is equal to the number of Knights you control.";
const ATTACK_TEXT =
  "Whenever this creature attacks, another target Knight you control gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)";

export default defineCard({
  name: "Wintermoor Commander",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 0,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${CDA_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Knight", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "toughness",
      },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Knight" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
