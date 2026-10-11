import { defineCard } from "../define.js";

// EDHREC rank 13502.
//
// Rulings:
//   [2026-08-21] Only one loyalty ability of each planeswalker may be activated per turn, no
//     matter how many it has gained.
//   [2026-08-21] Loyalty abilities can't be mana abilities. The ability granted by Way of the
//     Pyromancer uses the stack and can be countered or otherwise responded to. Like all loyalty
//     abilities, it can be activated only once per turn, during your main phase, when the stack is
//     empty, and only if no other loyalty abilities of this permanent have been activated this turn.
//
// The granted "+1: Add {R}" is a `loyaltyCost` ability, so it is never a mana
// ability (rule 606.3, `isManaAbility`): it goes on the stack, at sorcery speed,
// and counts as the permanent's one loyalty activation this turn.

const EMPOWER_TEXT =
  "When Way of the Pyromancer enters, empower Jace 2. (Put two loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const GRANT_TEXT = "Planeswalkers you control have \"[+1]: Add {R}.\"";

export default defineCard({
  name: "Way of the Pyromancer",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${EMPOWER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 2 },
      resolve: null,
      text: "When Way of the Pyromancer enters, empower Jace 2.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: 1,
          cost: { mana: null, tap: false },
          targets: [],
          effect: { kind: "add-mana", mana: "R", amount: 1 },
          resolve: null,
          text: "+1: Add {R}.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
