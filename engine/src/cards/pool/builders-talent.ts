import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

// EDHREC rank 11192.
// Makes Wall → new token "Wall Token (Builder's Talent)".
//
// Rulings:
//   [2024-07-26] Gaining a level is a normal activated ability. It uses the stack and can be
//     responded to.
//   [2024-07-26] You can't activate the first level ability of a Class unless that Class is level
//     1. Similarly, you can't activate the second level ability of a Class unless that Class is
//     level 2.
//   [2024-07-26] Each Class has five abilities. The three in the major sections of its text box
//     are class abilities. Class abilities can be static, activated, or triggered abilities. The
//     other two are level abilities, one activated ability to advance the Class to level 2 and
//     another to advance the Class to level 3.
//   [2024-07-26] Gaining a level won't remove abilities that a Class had at a previous level.
//   [2024-07-26] Each Class starts with only the first of its three class abilities. As the first
//     level ability resolves, the Class becomes level 2 and gains the second class ability. As the
//     second level ability resolves, the Class becomes level 3 and gains the third class ability.
//   [2024-07-26] There's no restriction on how many Class permanents you can control, whether
//     they're the same or different classes. Each Class permanent tracks its own level separately.
//
// Level 2's "whenever one or more noncreature, nonland permanents you control
// enter" is a `batched` enters trigger: once per simultaneous entry. Level 3's
// return is Cleric Class's shape, over "noncreature, nonland permanent card"
// (Astelli Reclaimer's filter).

const ENTER_TEXT = "When this Class enters, create a 0/4 white Wall creature token with defender.";
const LEVEL2_TEXT =
  "Whenever one or more noncreature, nonland permanents you control enter, put a +1/+1 counter on target creature you control.";
const LEVEL3_TEXT =
  "When this Class becomes level 3, return target noncreature, nonland permanent card from your graveyard to the battlefield.";

const NONCREATURE_NONLAND_PERMANENT = {
  typesAnyOf: ["artifact", "enchantment", "planeswalker", "battle"],
  notTypes: ["creature", "land"],
} as const;

export default defineCard({
  name: "Builder's Talent",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${ENTER_TEXT}\n{W}: Level 2\n${LEVEL2_TEXT}\n{4}{W}: Level 3\n${LEVEL3_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wall Token (Builder's Talent)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    atLevel(2, {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { notTypes: ["creature", "land"] }, batched: true },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LEVEL2_TEXT,
    }),
    atLevel(3, {
      trigger: { on: "class-level-gained", who: "self", level: 3 },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: NONCREATURE_NONLAND_PERMANENT }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: LEVEL3_TEXT,
    }),
  ],
  activated: [classLevel(2, "{W}"), classLevel(3, "{4}{W}")],
});
