import { defineCard } from "../define.js";

const NO_UNTAP = "Permanents don't untap during their controllers' untap steps.";
const UPKEEP = "At the beginning of each player's upkeep, that player chooses a permanent for each card in their graveyard, then untaps those permanents.";
const CARDS = { countInGraveyard: { ownedBy: "you" }, forPlayer: "active-player" } as const;

export default defineCard({
  name: "Mist of Stagnation",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${NO_UNTAP}\n${UPKEEP}`,
  static: [{ affects: { scope: "filter", filter: {} }, restrictions: ["doesnt-untap"], text: NO_UNTAP }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "active-player",
        filter: {},
        min: CARDS,
        upTo: CARDS,
        prompt: "Choose a permanent for each card in your graveyard to untap",
        then: { kind: "untap", target: 0 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
