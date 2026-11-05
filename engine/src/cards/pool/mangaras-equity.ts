import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {1}{W}.";
const DAMAGE_TEXT =
  "Whenever a creature of the chosen color deals damage to you or a white creature you control, this enchantment deals that much damage to that creature.";
const CHOSEN_CREATURE = { type: "creature", ofChosenColor: true } as const;
const HIT_BACK = { kind: "damage", amount: { triggerValue: true }, target: "trigger-object" } as const;

export default defineCard({
  name: "Mangara's Equity",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseOnEnter: ["B", "R"],
  text: `As this enchantment enters, choose black or red.\n${UPKEEP_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{1}{W}", text: "Pay {1}{W}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "any", to: "you", filter: CHOSEN_CREATURE },
      targets: [],
      effect: HIT_BACK,
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: {
        on: "deals-damage",
        who: "any",
        to: "creature",
        toFilter: { colors: ["W"], controlledBy: "you" },
        filter: CHOSEN_CREATURE,
      },
      sameAbilityAs: 1,
      targets: [],
      effect: HIT_BACK,
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
