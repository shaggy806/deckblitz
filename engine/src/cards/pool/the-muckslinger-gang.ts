import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The second static reaches off the
// battlefield (rule 604.1, `outsideBattlefield`): a creature spell you
// control on the stack and a creature card you own anywhere else but the
// battlefield get +3/+3 — what a filter reading their power sees. Once one
// is on the battlefield, only the first static's +3/+3 applies to it.
const ANTHEM_TEXT = "Each other creature you control gets +3/+3 as long as it's not attacking or blocking.";
const OUTSIDE_TEXT =
  "Creature spells you control and creature cards you own in any zone other than the battlefield or the stack get +3/+3.";

export default defineCard({
  name: "The Muckslinger Gang",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Lizard", "Beast"],
  power: 3,
  toughness: 3,
  text: `${ANTHEM_TEXT}\n${OUTSIDE_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", attacking: false, blocking: false },
        excludeSelf: true,
      },
      grantPt: [3, 3],
      text: ANTHEM_TEXT,
    },
    {
      affects: { scope: "self" },
      outsideBattlefield: { ofType: ["creature"], grantPt: [3, 3] },
      text: OUTSIDE_TEXT,
    },
  ],
});
