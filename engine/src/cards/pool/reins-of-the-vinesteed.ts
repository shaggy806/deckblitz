import { defineCard } from "../define.js";

// EDHREC rank 24850. No target: the creature is chosen as the Aura enters, among
// those sharing a creature type with the dead one as it last existed, whoever
// controls them; none it can enchant and it stays in the graveyard (the rulings).

const PUMP_TEXT = "Enchanted creature gets +2/+2.";
const RETURN_TEXT =
  "When enchanted creature dies, you may return this card from your graveyard to the battlefield attached to a creature that shares a creature type with that creature.";

export default defineCard({
  name: "Reins of the Vinesteed",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-zone", zones: ["graveyard"] },
            { kind: "source", filter: { ownedBy: "you" } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Return Reins of the Vinesteed from your graveyard to the battlefield?",
          effect: {
            kind: "put-onto-battlefield",
            target: "source",
            attachedTo: { among: { type: "creature", sharesCreatureTypeWith: "trigger-object" } },
          },
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
