import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 6925.
// Rulings:
//   Use Raubahn's power at the time the ward ability resolves to determine
//   how much life must be paid; if it has left, its power as it last existed
//   (`payLifeAmount`, rule 608.2h).
//   If the Equipment can't legally be attached to the target attacking
//   creature as the last ability resolves, it doesn't move.

const WARD_TEXT = "Ward—Pay life equal to Raubahn's power.";
const ATTACK_TEXT =
  "Whenever Raubahn attacks, attach up to one target Equipment you control to target attacking creature.";

export default defineCard({
  name: "Raubahn, Bull of Ala Mhigo",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${WARD_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      ...ward({ payLifeAmount: { powerOf: "source" }, text: "Pay life equal to Raubahn's power" }),
      text: WARD_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } } },
        { kind: "permanent", filter: { type: "creature", attacking: true } },
      ],
      effect: { kind: "attach", target: 1, attachment: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
