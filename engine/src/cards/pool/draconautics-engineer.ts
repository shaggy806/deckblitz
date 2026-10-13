import { defineCard } from "../define.js";

// EDHREC rank 13272.
//
// Rulings:
//   [2025-02-07] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.
//   [2025-02-07] Exhaust abilities can be activated any time you could normally activate an
//     ability.
//   [2025-02-07] If an ability triggers whenever you activate an exhaust ability, that ability
//     resolves before the exhaust ability resolves.

const HASTE_TEXT =
  "Exhaust — {R}: Other creatures you control gain haste until end of turn. Put a +1/+1 counter on this creature.";
const DRAGON_TEXT = "Exhaust — {3}{R}: Create a 4/4 red Dinosaur Dragon creature token with flying.";

export default defineCard({
  name: "Draconautics Engineer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 2,
  toughness: 2,
  text: `${HASTE_TEXT} (Activate each exhaust ability only once.)\n${DRAGON_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
            exceptSource: true,
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: HASTE_TEXT,
      exhaust: true,
    },
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Dragon Token", count: 1 },
      resolve: null,
      text: DRAGON_TEXT,
      exhaust: true,
    },
  ],
});
