import { defineCard } from "../define.js";

// "Whenever Cecil deals damage" names no recipient: once per damage event for
// the total (rule 603.2c, the Vessel of the All-Consuming ruling), so two
// blockers are one loss of life and one check. The transform does nothing to
// a Cecil that has left the battlefield (its ruling) or has transformed since
// the ability went on the stack (rule 701.27f).
const DARKNESS_TEXT =
  "Darkness — Whenever Cecil deals damage, you lose that much life. Then if your life total is less than or equal to half your starting life total, untap Cecil and transform it.";

export default defineCard({
  name: "Cecil, Dark Knight",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DARKNESS_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { triggerValue: true }, who: "you" },
          {
            kind: "conditional",
            condition: { kind: "life-total", atMost: "half-starting" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "untap", target: "source" },
                { kind: "transform", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: DARKNESS_TEXT,
    },
  ],
  faces: ["Cecil, Dark Knight", "Cecil, Redeemed Paladin"],
  transform: true,
});
