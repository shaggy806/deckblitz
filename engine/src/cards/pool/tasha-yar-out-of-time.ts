import { defineCard } from "../define.js";

const GRAVEYARD_TEXT =
  "{2}{R}, Exile this card from your graveyard: Create a token that's a copy of this card. Sacrifice it at the beginning of the next end step. Activate only as a sorcery.";

export default defineCard({
  name: "Tasha Yar, Out of Time",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\nWhen Tasha Yar dies, exile the top card of your library. Until the end of your next turn, you may play that card.\n${GRAVEYARD_TEXT}`,
  activated: [
    {
      // Embalm's shape: the cost exiles the card, and the copy is of the card itself.
      cost: { mana: "{2}{R}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, who: "you", asCard: true, sacrificeAtEndStep: true },
      resolve: null,
      text: GRAVEYARD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "until-end-of-your-next-turn" },
      resolve: null,
      text: "When Tasha Yar dies, exile the top card of your library. Until the end of your next turn, you may play that card.",
    },
  ],
});
