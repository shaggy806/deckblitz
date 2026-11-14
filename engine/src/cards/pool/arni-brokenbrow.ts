import { defineCard } from "../define.js";

// EDHREC rank 16940.
const BOAST_TEXT =
  "Boast — {1}: You may have Arni's base power become 1 plus the greatest power among other creatures you control until end of turn. (Activate only if this creature attacked this turn and only once each turn.)";

/**
 * Arni Brokenbrow. Only its base power is set (layer 7b, rule 613.4b): its
 * base toughness stays, and counters and "gets +N/+N" still apply on top.
 * The greatest power is read as the ability resolves, among Arni's
 * controller's other creatures — none is 0, making it a 1 (the rulings).
 */
export default defineCard({
  name: "Arni Brokenbrow",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${BOAST_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Arni's base power become 1 plus the greatest power among your other creatures until end of turn?",
        effect: {
          kind: "become",
          target: "source",
          power: {
            sum: [1, { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true }],
          },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: "Boast — {1}: You may have Arni's base power become 1 plus the greatest power among other creatures you control until end of turn.",
      boast: true,
    },
  ],
});
