import { defineCard } from "../define.js";

// EDHREC rank 14411. The return works only from the graveyard (rule 113.6k)
// and returns this card (Asgardian Inspiration's shape); "one or more
// creatures you control deal combat damage to a player" is the batched
// damage trigger, once per player dealt damage.

const RETURN_TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, you may pay {W/B}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Killian's Confidence",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: `Target creature gets +1/+1 until end of turn. Draw a card.\n${RETURN_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W/B} to return Killian's Confidence to your hand?",
        cost: "{W/B}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
