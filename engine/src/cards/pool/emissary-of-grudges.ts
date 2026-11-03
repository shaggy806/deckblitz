import { defineCard } from "../define.js";

// "Choose new targets" (rule 115.7d): any number of them, each kept even if it
// has become illegal. Both conditions are read as this resolves.

const CHOOSE = "As this creature enters, secretly choose an opponent.";
const REVEAL =
  "Reveal the player you chose: Choose new targets for target spell or ability if it's controlled by the chosen player and if it targets you or a permanent you control. Activate only once.";

export default defineCard({
  name: "Emissary of Grudges",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 6,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${CHOOSE}\n${REVEAL}`,
  choosePlayerOnEnter: "opponent",
  secretChoiceOnEnter: true,
  activated: [
    {
      cost: { mana: null, tap: false, revealChosen: true },
      onlyOnce: true,
      targets: [{ kind: "stack", spells: "any", abilities: true }],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: {
            controlledBy: "chosen-player",
            anyOf: [{ stackObjectTargets: { player: "you" } }, { stackObjectTargets: { permanent: { controlledBy: "you" } } }],
          },
        },
        then: { kind: "change-targets", target: 0, how: "choose-new" },
      },
      resolve: null,
      text: REVEAL,
    },
  ],
});
