import { defineCard } from "../define.js";

// Legends. Essence Flare's upkeep counter. When the creature dies the trigger
// waits while the Aura goes to the graveyard (704.5m), then returns it from
// there, if it's still there (the rulings: `fromGraveyard`). The dead creature's controller chooses — not a target,
// so shroud doesn't stop it, protection does (303.4) — a creature this could
// enchant (`enchantableBy: "source"`), and must if they can; the card returns
// under "your" control, its controller's as it left (the ruling). With none
// chosen it returns as a non-Aura enchantment (`enterAs.notAura`), noting
// that player as its chosen player for the ability it gains.

const UPKEEP = "At the beginning of the upkeep of enchanted creature's controller, put a -0/-1 counter on that creature.";
const GAINED = "At the beginning of that player's upkeep, this enchantment deals 1 damage to that player.";
const DIES = `When enchanted creature dies, that creature's controller chooses a creature that this card could enchant. If the player does, return this card to the battlefield under your control attached to that creature. If they don't, return this card to the battlefield under your control as a non-Aura enchantment. It loses "enchant creature" and gains "${GAINED}"`;

export default defineCard({
  name: "Takklemaggot",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP}\n${DIES}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "-0/-1", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", enchantableBy: "source" },
            min: 1,
            upTo: 1,
            chooser: { controllerOf: "trigger-object" },
            thenTogether: true,
            then: { kind: "sequence", effects: [] },
            prompt: "Choose a creature for Takklemaggot to enchant",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "chosen" },
            then: {
              kind: "put-onto-battlefield",
              target: "source",
              fromGraveyard: true,
              underYourControl: true,
              attachedTo: { thisWay: "chosen" },
            },
            else: {
              kind: "put-onto-battlefield",
              target: "source",
              fromGraveyard: true,
              underYourControl: true,
              chosenPlayer: { controllerOf: "trigger-object" },
              enterAs: {
                notAura: true,
                triggered: [
                  {
                    trigger: { on: "step-begins", step: "upkeep", who: "chosen-player" },
                    targets: [],
                    effect: { kind: "damage", amount: 1, who: "chosen-player" },
                    resolve: null,
                    text: GAINED,
                  },
                ],
              },
            },
          },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
