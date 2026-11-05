import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const STATIC_TEXT =
  "Enchanted creature gets +2/+2, has first strike and vigilance, and is a legendary Soldier in addition to its other types.";
const ATTACH_TEXT = "Whenever enchanted creature attacks or blocks, attach any number of target Equipment you control to it.";

const EQUIPMENT: TargetSpec = {
  kind: "any-number",
  of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } },
};
const ATTACH: EffectSpec = {
  kind: "for-each-target",
  from: 0,
  effect: { kind: "attach", target: "attached", attachment: 0 },
};

export default defineCard({
  name: "Super-Soldier Serum",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${ATTACH_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["first-strike", "vigilance"],
      addSupertypes: ["legendary"],
      addSubtypes: ["Soldier"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    { trigger: { on: "attacks", who: "attached" }, targets: [EQUIPMENT], effect: ATTACH, resolve: null, text: ATTACH_TEXT },
    { trigger: { on: "blocks", who: "attached" }, targets: [EQUIPMENT], effect: ATTACH, resolve: null, text: ATTACH_TEXT },
  ],
});
