import { defineCard } from "../define.js";

// EDHREC rank 12653.
//
// Rulings:
//   [2024-02-02] You make the choice to have the creature with unleash enter the battlefield with a
//     +1/+1 counter or not as it's entering the battlefield. At that point, it's too late for a
//     player to respond to the creature spell by trying to counter it, for example.
//   [2024-02-02] Putting a +1/+1 counter on a creature with unleash that's already blocking won't
//     remove it from combat. It will continue to block.
//   [2024-02-02] Count the number of attacking creatures when Tesak, Judith's Hellhound's last
//     ability resolves, including Tesak itself if it's still on the battlefield, to determine how
//     much mana to add.
//   [2024-02-02] A creature with unleash can't block if it has any +1/+1 counter on it, not just
//     one put on it by the unleash ability.
//   [2024-02-02] The unleash ability applies no matter where the creature is entering the
//     battlefield from.
//
// "Other Dogs you control have unleash" is a `grantKeywords` static: the granted unleash is asked
// as each other Dog enters under your control (rule 614.12), a token too, and its "can't block"
// half reads the keyword in the layer fold.

const MANA = "Whenever Tesak attacks, add {R} for each attacking creature.";

export default defineCard({
  name: "Tesak, Judith's Hellhound",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Dog"],
  power: 3,
  toughness: 3,
  keywords: ["unleash"],
  text: `Unleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)\nOther Dogs you control have unleash.\nCreatures you control with counters on them have haste.\n${MANA}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Dog", controlledBy: "you" }, excludeSelf: true },
      grantKeywords: ["unleash"],
      text: "Other Dogs you control have unleash.",
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["haste"],
      text: "Creatures you control with counters on them have haste.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: { countOf: { type: "creature", attacking: true } } },
      resolve: null,
      text: MANA,
    },
  ],
});
