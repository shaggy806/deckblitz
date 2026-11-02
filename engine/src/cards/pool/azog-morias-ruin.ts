import { defineCard } from "../define.js";

const TRIGGER =
  "When Azog enters, destroy up to one other target creature. Its controller amasses Goblins X, where X is that creature's power. If you controlled that creature, draw a card.";

// No target chosen: "its controller" is undefined, and no player amasses (the
// ruling). X is its power as it last existed (the ruling).
export default defineCard({
  name: "Azog, Moria's Ruin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Goblin", "Soldier"],
  power: 1,
  toughness: 3,
  text: `${TRIGGER} (To amass Goblins X, that player puts X +1/+1 counters on an Army they control. It's also a Goblin. If they don't control an Army, they create a 0/0 black Goblin Army creature token first.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "amass", amount: { powerOf: 0 }, creatureType: "Goblin", who: { controllerOfTarget: 0 } },
          {
            kind: "conditional",
            condition: { kind: "target-controlled-by-you", index: 0 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
