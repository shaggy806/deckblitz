import { defineCard } from "../define.js";

const KEEP = "You don't lose unspent red mana as steps and phases end.";
const CAST = "Whenever you cast an instant or sorcery spell, add {R}.";
const LEAVES = "When Electro leaves the battlefield, you may pay {X}. When you do, he deals X damage to target player.";

// The leave trigger has no target: X is paid as it resolves, then a reflexive
// ability targets a player (Leyline Tyrant's shape).
export default defineCard({
  name: "Electro, Assaulting Battery",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${KEEP}\n${CAST}\n${LEAVES}`,
  static: [{ affects: { scope: "self" }, keepsUnspentMana: ["R"], text: KEEP }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to have Electro deal X damage to target player?",
        cost: "{X}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["player"],
          effect: { kind: "damage", amount: "x", target: 0 },
          text: "When you do, he deals X damage to target player.",
        },
      },
      resolve: null,
      text: LEAVES,
    },
  ],
});
