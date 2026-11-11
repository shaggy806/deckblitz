import { defineCard } from "../define.js";

const TARGETED_TEXT =
  "Whenever a creature you control or a creature spell you control becomes the target of a spell or ability an opponent controls, draw a card.";

/** `orSpell`: a creature spell on the stack counts beside a creature on the
 * battlefield (an opponent's Counterspell at your creature spell). */
export default defineCard({
  name: "Surrak, Elusive Hunter",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: "This spell can't be countered.\nTrample\n" + TARGETED_TEXT,
  cantBeCountered: true,
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { type: "creature" },
        orSpell: true,
        byOpponentOnly: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TARGETED_TEXT,
    },
  ],
});
