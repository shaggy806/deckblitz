import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 7750. Final Fantasy.
//
// Rulings:
//   [2025-06-06] Hraesvelgr's last ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.
//   [2025-06-06] Once a creature has been blocked, Hraesvelgr's last ability won't cause it to
//     become unblocked.
//
// "When ~ enters and whenever you cast a noncreature spell" is one ability
// with two trigger events, so two triggers with Distortion Strike's one
// effect: any target creature, +1/+0 and unblockable this turn.
const AID_TEXT =
  "Shiva's Aid — When Hraesvelgr enters and whenever you cast a noncreature spell, target creature gets +1/+0 until end of turn and can't be blocked this turn.";

const AID: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
    { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
  ],
};

export default defineCard({
  name: "Hraesvelgr of the First Brood",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance, ward {2}\n${AID_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: AID,
      resolve: null,
      text: AID_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: ["creature"],
      effect: AID,
      resolve: null,
      text: AID_TEXT,
    },
  ],
});
