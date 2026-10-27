import { defineCard } from "../define.js";

export default defineCard({
  name: "Cauldron Dance",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Cast this spell only during combat.\nReturn target creature card from your graveyard to the battlefield. That creature gains haste. Return it to your hand at the beginning of the next end step.\nYou may put a creature card from your hand onto the battlefield. That creature gains haste. Its controller sacrifices it at the beginning of the next end step.",
  castOnlyIf: { kind: "turn-structure", duringCombat: true },
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      // "Gains haste" has no duration: it lasts as long as it stays.
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "return-to-hand", target: 0 },
        text: "Return the creature Cauldron Dance returned to the battlefield to your hand.",
      },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-target", target: 0, byItsController: true },
              text: "Its controller sacrifices the creature Cauldron Dance put onto the battlefield from your hand.",
            },
          ],
        },
      },
    ],
  },
});
