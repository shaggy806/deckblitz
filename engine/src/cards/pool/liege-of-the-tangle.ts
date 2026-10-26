import { defineCard } from "../define.js";

// EDHREC rank 11470.
//
// Rulings:
//   Each land stays an 8/8 green Elemental creature only while it has an
//     awakening counter, whether or not Liege is still around
//     (`whileCounter` — rule 611.2b; Sauron, Dino Devotee's shape).
//   An awakening counter moved to another land doesn't animate it: the
//     effect is on the land it was put on.

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, you may choose any number of target lands you control and put an awakening counter on each of them. Each of those lands is an 8/8 green Elemental creature for as long as it has an awakening counter on it. They're still lands.";

export default defineCard({
  name: "Liege of the Tangle",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "any-number", of: "land-you-control" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "awakening", amount: 1 },
            {
              kind: "animate",
              target: 0,
              power: 8,
              toughness: 8,
              addTypes: ["creature"],
              addSubtypes: ["Elemental"],
              setColors: ["G"],
              duration: { whileCounter: "awakening" },
            },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
