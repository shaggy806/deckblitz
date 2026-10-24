import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Magic Origins. EDHREC rank 8687.
//
// Rulings:
//   [2015-06-22] Count the number of creatures you control other than the equipped creature as
//     Sigil of Valor's ability resolves to determine the amount of the bonus.
//   [2015-06-22] A creature attacks alone if it's the only creature declared as an attacker
//     during the declare attackers step.
//
// "Each other creature" is every creature you control but the attacker (the
// trigger object) — not this Equipment, so `excludeSelf` would be wrong. The
// count is read as the ability resolves: all your creatures, less one while
// the attacker is still a creature you control. "It" is the attacker, so the
// bonus follows it even if the Sigil has moved since.
const TRIGGER_TEXT =
  "Whenever equipped creature attacks alone, it gets +1/+1 until end of turn for each other creature you control.";
const YOUR_CREATURES = { countOf: { type: "creature", controlledBy: "you" } } as const;
const OTHERS = { difference: [YOUR_CREATURES, 1] } as const;

export default defineCard({
  name: "Sigil of Valor",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TRIGGER_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { type: "creature", controlledBy: "you" } },
        then: { kind: "modify-pt", target: "trigger-object", power: OTHERS, toughness: OTHERS, duration: "end-of-turn" },
        else: {
          kind: "modify-pt",
          target: "trigger-object",
          power: YOUR_CREATURES,
          toughness: YOUR_CREATURES,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
