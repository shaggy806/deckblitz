import { defineCard } from "../define.js";

const ENTERS =
  "When this Aura enters, target creature you control other than enchanted creature gets +2/+2 and gains vigilance until end of turn.";
const STATIC = "Enchanted creature gets +2/+2 and has vigilance.";

// Attached to its target before it resolves, the target is illegal and the
// ability does nothing (the ruling): `hostOfSource` is read as it is then.
export default defineCard({
  name: "Due Diligence",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${STATIC}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", hostOfSource: false } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], grantKeywords: ["vigilance"], text: STATIC }],
});
