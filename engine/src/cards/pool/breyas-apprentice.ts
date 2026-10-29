import { defineCard } from "../define.js";

// Rulings:
//   [2021-06-18] You can sacrifice any artifact, not just a Thopter.
//   [2021-06-18] If you choose the first mode, you must still pay any costs and follow any timing
//     restrictions to play the card.
//   [2021-06-18] The exiled card is exiled face up.

const MODAL_TEXT =
  "{T}, Sacrifice an artifact: Choose one —\n• Exile the top card of your library. Until the end of your next turn, you may play that card.\n• Target creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Breya's Apprentice",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: `When this creature enters, create a 1/1 colorless Thopter artifact creature token with flying.\n${MODAL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      // Its mode chosen as it's activated, bringing its target (rule 700.2b).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Exile the top card of your library. Until the end of your next turn, you may play that card.",
            effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
          },
          {
            text: "Target creature gets +2/+0 until end of turn.",
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: MODAL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 colorless Thopter artifact creature token with flying.",
    },
  ],
});
