import { defineCard } from "../define.js";

// An intervening-if (rule 603.4): either half true as it triggers, either half
// true as it resolves (its ruling).
const ENTER_TEXT =
  "When this creature enters, if you control a Desert or there is a Desert card in your graveyard, you may have this creature deal 3 damage to target creature.";

export default defineCard({
  name: "Sand Strangler",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Sand Strangler deal 3 damage to the target creature?",
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
