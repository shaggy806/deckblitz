import { defineCard } from "../define.js";

// EDHREC rank 13538. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] Grasping Shadows keeps its dread counters as it transforms into Shadows' Lair.
//   [2023-11-10] Once the ability of Grasping Shadows has triggered, creatures entering the
//     battlefield attacking won't affect that ability.
//   [2023-11-10] A creature attacks alone if it's the only creature declared as an attacker during
//     the declare attackers step.
//
// Widow's Walk's "attacks alone" grant, then Wedding Announcement's counter
// and `self-counters` check before transforming. A transformed permanent is
// the same object, so its dread counters stay (the ruling).

const TEXT =
  "Whenever a creature you control attacks alone, it gains deathtouch and lifelink until end of turn. Put a dread counter on this enchantment. Then if there are three or more dread counters on it, transform it.";

export default defineCard({
  name: "Grasping Shadows",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "trigger-object", keyword: "deathtouch", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "lifelink", duration: "end-of-turn" },
          { kind: "add-counter", target: "source", counter: "dread", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "dread", compare: { op: "gte", n: 3 } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Grasping Shadows", "Shadows' Lair"],
  transform: true,
});
