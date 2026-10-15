import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7693.
//
// Rulings:
//   [2025-06-13] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//   [2025-06-13] If the Hero token is destroyed, the Equipment stays on the battlefield.
//
// - Job select is Samurai's Katana's trigger.
// - "During your turn, equipped creature has flying" is Bilbo's Ring's
//   `your-turn` condition on an attached grant.
// - "Gae Bolg" is an ability word: the ability is plain equip {4}.
const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const EQUIPPED_TEXT = "Equipped creature gets +1/+0 and is a Knight in addition to its other types.";
const FLYING_TEXT = "During your turn, equipped creature has flying.";

export default defineCard({
  name: "Dragoon's Lance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\n${FLYING_TEXT}\nGae Bolg — Equip {4}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: JOB_TEXT,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 0], addSubtypes: ["Knight"], text: EQUIPPED_TEXT },
    { affects: { scope: "attached" }, condition: { kind: "your-turn" }, grantKeywords: ["flying"], text: FLYING_TEXT },
  ],
  activated: [{ ...equip("{4}"), text: "Gae Bolg — Equip {4}" }],
});
