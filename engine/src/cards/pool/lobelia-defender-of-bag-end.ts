import { defineCard } from "../define.js";

// EDHREC rank 7300. Only Lobelia's controller may look at the face-down cards,
// even if another player gains control of her; a new Lobelia can't play the old
// one's cards (the rulings). One card, with its timing and land-drop rules.
const ETB_TEXT = "When Lobelia enters, look at the top card of each opponent's library and exile those cards face down.";
const MODAL_TEXT = "{T}, Sacrifice an artifact: Choose one —";
const PLAY = "Until end of turn, you may play a card exiled with Lobelia without paying its mana cost.";
const DRAIN = "Each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Lobelia, Defender of Bag End",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${MODAL_TEXT}\n• ${PLAY}\n• ${DRAIN}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: PLAY, effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "exile", linked: true, play: true, free: true, upTo: 1 } } },
          {
            text: DRAIN,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", who: "each-opponent", amount: 2 },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `${MODAL_TEXT} ${PLAY} ${DRAIN}`,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-opponent", amount: 1, faceDown: "looked", linked: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
