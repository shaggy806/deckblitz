import { defineCard } from "../define.js";

// EDHREC rank 6063. "If you do": only once the Aura is attached again; with no
// creature to go on, no untap and no combat, and it goes to the graveyard as a
// state-based action (the ruling).
const TEXT =
  "When enchanted creature deals combat damage to a player, sacrifice it and attach this Aura to a creature you control. If you do, untap all creatures you control and after this phase, there is an additional combat phase.";

export default defineCard({
  name: "Breath of Fury",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${TEXT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-target", target: "attached" },
          {
            kind: "attach",
            target: "source",
            ontoChosen: {
              filter: { type: "creature", controlledBy: "you" },
              prompt: "Attach Breath of Fury to a creature you control",
            },
          },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
                { kind: "additional-combat", afterThisPhase: true },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
