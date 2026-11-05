import { defineCard } from "../define.js";

const ATTACK = "Whenever this creature attacks, it gets +1/+0 until end of turn for each land defending player controls.";
const ENCORE =
  "Encore {4}{R}{R} ({4}{R}{R}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Coastline Marauders",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 0,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ATTACK}\n${ENCORE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "land", controlledBy: "you" }, forPlayer: "trigger-player" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{R}{R}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE,
    },
  ],
});
