import { defineCard } from "../define.js";

// EDHREC rank 13142. Marvel Super Heroes.
//
// I — "If you do" asks whether you drew (`this-way` `"drawn"`, Mr.
// Foxglove's): choosing to with no artifacts draws nothing, so the
// opponents draw nothing either. II — a player effect for the rest of the
// turn (Ballad of the Black Flag's chapter IV), so it outlives the Saga.
// III — X is the greatest mana value among your artifacts as it resolves
// (One with the Machine's aggregate); the Saga deals the damage.
const ARTIFACTS = { type: "artifact", controlledBy: "you" } as const;
const CHAPTER_I = "I — You may draw a card for each artifact you control. If you do, each opponent draws a card.";
const CHAPTER_II = "II — Artifact spells you cast this turn cost {1} less to cast.";
const CHAPTER_III =
  "III — This Saga deals X damage to target opponent, where X is the greatest mana value among artifacts you control.";

export default defineCard({
  name: "Armor Wars",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card for each artifact you control?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { countOf: ARTIFACTS } },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: { kind: "draw", amount: 1, who: "each-opponent" },
            },
          ],
        },
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        reduceSpells: { applies: { type: "artifact" }, reduceGeneric: 1 },
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["opponent"],
      effect: {
        kind: "damage",
        amount: { aggregate: "max", of: "mana-value", filter: ARTIFACTS },
        target: 0,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
