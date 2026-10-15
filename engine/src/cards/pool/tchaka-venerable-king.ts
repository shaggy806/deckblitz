import { defineCard } from "../define.js";

// EDHREC rank 20369.
// The mill is Dredger's Insight's: a pick from among the cards milled this
// way, optional. The graveyard ability pays by exiling the card (Bramble
// Wurm's `zone: "graveyard"`); "your commander" is a commander you own on
// the battlefield under your control (Ironwill Forger's lieutenant check).

const ETB_TEXT =
  "When T'Chaka enters, mill three cards, then you may put an artifact or land card from among the milled cards into your hand.";
const MONARCH_TEXT =
  "{3}, Exile this card from your graveyard: You become the monarch. Activate only if you control your commander.";

export default defineCard({
  name: "T'Chaka, Venerable King",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Hero"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${MONARCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      zone: "graveyard",
      condition: { kind: "controls", filter: { isCommander: true, ownedBy: "you" }, atLeast: 1 },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", typesAnyOf: ["artifact", "land"] },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
