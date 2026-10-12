import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 12144. Torbran, Thane of Red Fell's replacement, colourless
// and +1, at max speed: the extra damage is the original source's (the
// rulings), and divided or assigned damage is divided before it's added.
const ATTACK_TEXT = "Whenever you attack, Far Fortune deals 1 damage to each opponent.";
const PLUS_TEXT =
  "If a source you control would deal damage to an opponent or a permanent an opponent controls, it deals that much damage plus 1 instead.";

export default defineCard({
  name: "Far Fortune, End Boss",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 4,
  toughness: 5,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ATTACK_TEXT}\nMax speed — ${PLUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    maxSpeed({
      replacement: {
        event: "would-deal-damage",
        plus: 1,
        source: { controlledBy: "you" },
        to: "opponent-side",
      },
      text: `Max speed — ${PLUS_TEXT}`,
    }),
  ],
});
