import { defineCard } from "../define.js";

// EDHREC rank 3529. The added combat phase's "only land creatures can attack"
// is `additional-combat`'s `onlyAttackers`: a restriction for that phase alone
// (rule 508.1c), read as attackers are declared.
//
// Rulings:
//   [2025-10-02] The restriction that only land creatures can attack applies only to the combat
//     phase created by Bumi, Unleashed, not to any other combat phases that might occur that turn.
//   [2025-10-02] "Earthbend N" means "Target land you control becomes a 0/0 land creature with
//     haste in addition to its other types. Put N +1/+1 counters on it. When it dies or is exiled,
//     return it to the battlefield tapped under your control."

const ENTERS_TEXT = "When Bumi enters, earthbend 4.";
const DAMAGE_TEXT =
  "Whenever Bumi deals combat damage to a player, untap all lands you control. After this phase, there is an additional combat phase. Only land creatures can attack during that combat phase.";

export default defineCard({
  name: "Bumi, Unleashed",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text:
    "Trample\n" +
    "When Bumi enters, earthbend 4. (Target land you control becomes a 0/0 creature with haste that's still a land. Put four +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)\n" +
    DAMAGE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 4 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
          { kind: "additional-combat", afterThisPhase: true, onlyAttackers: { type: "land" } },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
