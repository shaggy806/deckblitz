import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 2299.
//
// Animate Dead's frame (see `animate-dead.ts`): it enters attached to a
// creature card in a graveyard, swaps its enchant ability, puts the card onto
// the battlefield tapped and attaches itself to it; leaving, it has that
// creature's controller sacrifice it (a delayed ability its enters ability
// makes). The upkeep trigger is Paralyze's: on the upkeep of the enchanted
// creature's controller, who may pay {1}{B} to untap it.
const ENTERS =
  "When this Aura enters, if it's on the battlefield, it loses \"enchant creature card in a graveyard\" and gains \"enchant creature put onto the battlefield with this Aura.\" Put enchanted creature card onto the battlefield tapped under your control and attach this Aura to it. When this Aura leaves the battlefield, that creature's controller sacrifices it.";
const LEAVES = "When this Aura leaves the battlefield, that creature's controller sacrifices it.";
const UPKEEP =
  "At the beginning of the upkeep of enchanted creature's controller, that player may pay {1}{B}. If the player does, untap that creature.";
const LEAVING = ["graveyard", "exile", "hand", "library", "command"] as const;

export default defineCard({
  name: "Dance of the Dead",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature card in a graveyard\n${ENTERS}\nEnchanted creature gets +1/+1 and doesn't untap during its controller's untap step.\n${UPKEEP}`,
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: "attached", underYourControl: true, enterTapped: true },
            { kind: "swap-enchant", enchant: "put-this-way" },
            { kind: "attach", target: "put-this-way" },
            {
              kind: "delayed-trigger",
              at: { leaves: "source", to: LEAVING },
              about: "put-onto-battlefield",
              effect: { kind: "sacrifice-target", target: 0, byItsController: true },
              text: LEAVES,
            },
          ],
        },
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Pay {1}{B} to untap the creature enchanted by Dance of the Dead?",
        options: [{ pay: "{1}{B}", text: "Pay {1}{B} to untap it" }],
        ifDid: { kind: "untap", target: "attached" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature gets +1/+1 and doesn't untap during its controller's untap step.",
    },
  ],
});
