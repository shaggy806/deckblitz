import { defineCard } from "../define.js";

// Front face. More Than Meets the Eye (rule 702.162a); convert is transform.
// "Then if Cyclonus's power is 5 or greater" is read after it connives, so
// the +1/+1 counter from a discarded nonland card counts.
const TRIGGER_TEXT =
  "Whenever Cyclonus deals combat damage to a player, it connives. Then if Cyclonus's power is 5 or greater, convert it. (To have a creature connive, draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

export default defineCard({
  name: "Cyclonus, the Saboteur",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `More Than Meets the Eye {5}{U}{B} (You may cast this card converted for {5}{U}{B}.)\nFlying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "connive", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { power: { op: "gte", n: 5 } } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  faces: ["Cyclonus, the Saboteur", "Cyclonus, Cybertronian Fighter"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{5}{U}{B}" },
});
