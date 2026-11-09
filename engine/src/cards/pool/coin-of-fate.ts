import { defineCard } from "../define.js";

const ACT_TEXT =
  "{3}{W}, {T}, Exile two creature cards from your graveyard, Sacrifice this artifact: An opponent chooses one of the exiled cards. You put that card on the bottom of your library and return the other to the battlefield tapped. You become the monarch.";

const THE_EXILED = { inSet: { paid: "exiled" } } as const;

// EDHREC rank 13251. You choose the opponent, then they choose a card; the
// other returns tapped under your control.
export default defineCard({
  name: "Coin of Fate",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `When this artifact enters, surveil 1.\n${ACT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "When this artifact enters, surveil 1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: true, exileFromGraveyard: { count: 2, filter: { type: "creature" } }, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-opponent",
            then: {
              kind: "look-and-choose",
              zone: "exile",
              chooser: "that-player",
              filter: THE_EXILED,
              min: 1,
              max: 1,
              destination: "library-bottom",
              leftover: "stay",
              prompt: "Choose one of the exiled cards to go on the bottom of their owner's library",
            },
          },
          {
            kind: "look-and-choose",
            zone: "exile",
            filter: THE_EXILED,
            min: 1,
            max: 1,
            destination: "battlefield",
            enterTapped: true,
            leftover: "stay",
            prompt: "Return the other card to the battlefield tapped",
          },
          { kind: "become-monarch" },
        ],
      },
      resolve: null,
      text: ACT_TEXT,
    },
  ],
});
