import { defineCard } from "../define.js";

// EDHREC rank 4519. Sacrificed together, one instruction; the reflexive group
// is bounded by how many were (targets chosen as it goes on the stack).
const MY_TREASURES = { subtype: "Treasure", controlledBy: "you" } as const;
const ATTACK_TEXT = "Whenever you attack, you may sacrifice one or more Treasures. When you do, up to that many target creatures gain double strike until end of turn.";

export default defineCard({
  name: "Swashbuckler Extraordinaire",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon", "Rogue", "Warrior"],
  power: 2,
  toughness: 2,
  text: `When this creature enters, create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Treasure token.",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: MY_TREASURES,
            upTo: { countOf: MY_TREASURES },
            min: 0,
            thenTogether: true,
            then: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "sacrifice-target", target: 0 } },
            prompt: "Sacrifice one or more Treasures (or none)",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
              value: { thisWay: "sacrificed" },
              effect: {
                kind: "for-each-target",
                from: 0,
                effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
              },
              text: "When you do, up to that many target creatures gain double strike until end of turn.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
