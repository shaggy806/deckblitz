import { defineCard } from "../define.js";

// Your choice, and whether it's equipped, both as it resolves. Reconfigure isn't
// an equip ability, and only generic mana comes off (the rulings).
const COMBAT_TEXT =
  "At the beginning of combat on your turn, target creature gains your choice of first strike or vigilance until end of turn. If that creature is equipped, it gains first strike and vigilance until end of turn instead.";
const EQUIP_TEXT = "Equip abilities you activate cost {1} less to activate.";

export default defineCard({
  name: "Éowyn, Lady of Rohan",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 4,
  text: `${COMBAT_TEXT}\n${EQUIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { equipped: true } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          ],
        },
        else: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "First strike",
              effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
            },
            {
              text: "Vigilance",
              effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, reduceGeneric: 1 },
      text: EQUIP_TEXT,
    },
  ],
});
