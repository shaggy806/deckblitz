import { defineCard } from "../define.js";

// EDHREC rank 9011.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2023-06-16] You don't choose a mode for Gorbag of Minas Morgul's ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you sacrifice a Goblin or Orc
//     this way. You choose a mode for that ability as it goes on the stack. Each player may
//     respond to this triggered ability as normal.

export default defineCard({
  name: "Gorbag of Minas Morgul",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Whenever a Goblin or Orc you control deals combat damage to a player, you may sacrifice it. When you do, choose one —\n• Draw a card.\n• Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { anyOf: [{ subtype: "Goblin" }, { subtype: "Orc" }] },
      },
      targets: [],
      // The mode is chosen as the reflexive ability goes on the stack, once
      // the creature has been sacrificed (the ruling — rule 603.12).
      effect: {
        kind: "may",
        prompt: "Sacrifice that creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-target", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed" },
              then: {
                kind: "reflexive-trigger",
                targets: [],
                effect: {
                  kind: "modal",
                  announced: true,
                  minModes: 1,
                  maxModes: 1,
                  modes: [
                    { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
                    {
                      text: "Create a Treasure token.",
                      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
                    },
                  ],
                },
                text: "When you do, choose one — • Draw a card. • Create a Treasure token.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: "Whenever a Goblin or Orc you control deals combat damage to a player, you may sacrifice it. When you do, choose one —\n• Draw a card.\n• Create a Treasure token.",
    },
  ],
});
