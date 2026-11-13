import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't block.";
const RAD_TEXT = "Whenever this creature deals combat damage to a player, they get that many rad counters.";
// The ability returns this card from the graveyard, so it works only there
// (rule 113.6k): once per nonland card an opponent mills (rule 603.2c). One
// milled at the same time as that card — "each player mills a card" — is
// already in the graveyard to see it (the card's ruling).
const RETURN_TEXT =
  "Whenever an opponent mills a nonland card, if this creature is in your graveyard, you may return it to your hand.";

export default defineCard({
  name: "Infesting Radroach",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Mutant"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${BLOCK_TEXT}\n${RAD_TEXT}\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: { triggerValue: true }, who: "trigger-player" },
      resolve: null,
      text: RAD_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "mills", who: "opponent", filter: { notTypes: ["land"] }, perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Infesting Radroach from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
