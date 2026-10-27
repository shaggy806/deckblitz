import { defineCard } from "../define.js";

// EDHREC rank 20431. "If you do" is "if you choose to reveal" (the ruling):
// declining does nothing; revealing with no creature card left still
// shuffles every revealed card back (`rest: "shuffle"`).
export default defineCard({
  name: "Thicket Elemental",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  kicker: { cost: "{1}{G}" },
  text: "Kicker {1}{G} (You may pay an additional {1}{G} as you cast this spell.)\nWhen this creature enters, if it was kicked, you may reveal cards from the top of your library until you reveal a creature card. If you do, put that card onto the battlefield and shuffle all other cards revealed this way into your library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal cards from the top of your library until you reveal a creature card?",
        effect: { kind: "reveal-until", filter: { type: "creature" }, put: "battlefield", rest: "shuffle" },
      },
      resolve: null,
      text: "When this creature enters, if it was kicked, you may reveal cards from the top of your library until you reveal a creature card. If you do, put that card onto the battlefield and shuffle all other cards revealed this way into your library.",
      condition: { kind: "self-kicked" },
    },
  ],
});
