import { defineCard } from "../define.js";

// EDHREC rank 18402. The dead creature's controller (as it last existed)
// chooses the target as the ability goes on the stack (rule 603.3d), though
// the ability stays the Aura's controller's: "one of their opponents" is read
// from the chooser's side (`controlledBy: "chooser-opponent"`), as the target
// is chosen and again as it resolves. No legal target, or an illegal one as it
// resolves, and the Aura stays in the graveyard. It returns under the
// ability's controller's control (rule 110.2), attached to that creature.
const SAC_TEXT = "At the beginning of your upkeep, sacrifice this creature.";
const GRANT_TEXT = `Enchanted creature has "${SAC_TEXT}"`;
const RETURN_TEXT =
  "When enchanted creature dies, its controller chooses target creature one of their opponents controls. Return this card from its owner's graveyard to the battlefield attached to that creature.";

export default defineCard({
  name: "Necrotic Plague",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "sacrifice-source" },
          resolve: null,
          text: SAC_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targetsChosenBy: "trigger-object-controller",
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", controlledBy: "chooser-opponent" },
        },
      ],
      effect: {
        kind: "conditional",
        condition: { kind: "source-zone", zones: ["graveyard"] },
        then: { kind: "put-onto-battlefield", target: "source", attachedTo: 0 },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
