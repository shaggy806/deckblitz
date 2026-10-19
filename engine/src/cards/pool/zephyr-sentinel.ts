import { defineCard } from "../define.js";

// EDHREC rank 19222. The Brothers' War.

const ENTER_TEXT =
  "When this creature enters, return up to one other target creature you control to its owner's hand. If it was a Soldier, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Zephyr Sentinel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      // Rescue, Pepper Potts's shape: "if it was a Soldier" asks about the
      // returned creature as it last existed on the battlefield.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Soldier" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
