import { atLevel, classLevel } from "../helpers.js";
import { defineCard } from "../define.js";

// A Class (rule 716): level 3's look is a conditional `visibility` static, in
// no one's view before then.
const ENTER = "When this Class enters, create a 2/2 green Wolf creature token.";
const ATTACK = "Whenever you attack, put a +1/+1 counter on target attacking creature.";
const LOOK = "You may look at the top card of your library any time.";
const CAST = "You may cast creature spells from the top of your library.";

export default defineCard({
  name: "Ranger Class",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\n${ENTER}\n{1}{G}: Level 2\n${ATTACK}\n{3}{G}: Level 3\n${LOOK}\n${CAST}`,
  static: [
    atLevel(3, { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK }),
    atLevel(3, { affects: { scope: "self" }, mayPlay: { from: "library-top", filter: { type: "creature" } }, text: CAST }),
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: ENTER,
    },
    atLevel(2, {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK,
    }),
  ],
  activated: [classLevel(2, "{1}{G}"), classLevel(3, "{3}{G}")],
});
