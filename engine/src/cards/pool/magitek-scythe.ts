import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14094.

const ENTER_TEXT =
  "A Test of Your Reflexes! — When this Equipment enters, you may attach it to target creature you control. If you do, that creature gains first strike until end of turn and must be blocked this turn if able.";

export default defineCard({
  name: "Magitek Scythe",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\nEquipped creature gets +2/+1.\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "may",
        prompt: "Attach Magitek Scythe to the targeted creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "attach", target: 0, attachment: "source" },
            {
              // "If you do": the attach happened — the Scythe is still the
              // same object on the battlefield (rule 400.7) and attached.
              // With the target illegal the whole ability doesn't resolve.
              kind: "conditional",
              condition: {
                kind: "all",
                of: [
                  { kind: "source-on-battlefield" },
                  { kind: "source", filter: { attachedTo: { type: "creature" } } },
                ],
              },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
                  { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
  activated: [equip("{2}")],
});
