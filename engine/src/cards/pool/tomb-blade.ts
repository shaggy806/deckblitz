import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, that player loses life equal to the number of creatures they control unless they sacrifice a creature of their choice.";

export default defineCard({
  name: "Tomb Blade",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}\nUnearth {6}{B}{B}`,
  activated: [
    {
      cost: { mana: "{6}{B}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", exileIfItWouldLeave: true },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            effect: { kind: "exile", target: "source" },
            text: "Exile the unearthed card.",
          },
        ],
      },
      resolve: null,
      text: "Unearth {6}{B}{B}",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-player",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        otherwise: {
          kind: "lose-life",
          who: "trigger-player",
          amount: { countOf: { type: "creature", controlledBy: "you" }, forPlayer: "trigger-player" },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
