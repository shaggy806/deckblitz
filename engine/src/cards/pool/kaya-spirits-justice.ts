import { defineCard } from "../define.js";

// Murders at Karlov Manor Commander. EDHREC rank 14466.
//
// Rulings:
//   If a creature card that was exiled is no longer in exile when the first ability resolves
//     (perhaps because of Pull from Eternity), you can't choose that creature card.
//   You choose all targets for the last ability.
//   The target token copies the printed values of the card in exile, with the noted exception.
//
// The first ability is one trigger for one move, however many of its cards came from the
// battlefield and from the graveyard (`put-into-exile` with `controlledFromBattlefield`: a
// creature you controlled as it last existed there, a token included — rule 603.10a — or a
// creature card from your graveyard). As it resolves you may choose a creature card among them
// still in exile, the same object (`look-and-choose` of `"trigger-batch"`, rule 400.7; a token
// has ceased to exist, and isn't a card); the targeted token becomes a copy of that card's
// printed values (rule 707.2, `ofCard`) with flying, until end of turn. The +2's exile is no
// linked ability's (rule 607.2a). The −2's targets are all chosen as it's activated, one slot
// per other player, and its two sentences exile one after the other.

const STATIC_TRIGGER =
  "Whenever one or more creatures you control and/or creature cards in your graveyard are put into exile, you may choose a creature card from among them. Until end of turn, target token you control becomes a copy of it, except it has flying.";
const PLUS_TWO = "+2: Surveil 2, then exile a card from a graveyard.";
const PLUS_ONE = "+1: Create a 1/1 white and black Spirit creature token with flying.";
const MINUS_TWO =
  "−2: Exile target creature you control. For each other player, exile up to one target creature that player controls.";

const opponentsCreature = (seat: 1 | 2 | 3) =>
  ({ kind: "optional", of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } } }) as const;

export default defineCard({
  name: "Kaya, Spirits' Justice",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaya"],
  loyalty: 3,
  text: `${STATIC_TRIGGER}\n${PLUS_TWO}\n${PLUS_ONE}\n${MINUS_TWO}`,
  triggered: [
    {
      trigger: {
        on: "put-into-exile",
        who: "you",
        from: ["battlefield", "graveyard"],
        filter: { type: "creature" },
        controlledFromBattlefield: true,
      },
      targets: [{ kind: "permanent", whose: "you", filter: { token: true } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "trigger-batch",
            min: 0,
            max: 1,
            filter: { type: "creature" },
            destination: "stay",
            leftover: "stay",
            prompt: "You may choose a creature card from among them. Until end of turn, the target token becomes a copy of it, except it has flying.",
          },
          {
            kind: "become-copy",
            target: 0,
            of: { thisWay: "chosen" },
            ofCard: true,
            until: "end-of-turn",
            exceptions: { keywords: ["flying"] },
          },
        ],
      },
      resolve: null,
      text: STATIC_TRIGGER,
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 1,
            max: 1,
            destination: "exile",
            unlinked: true,
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: PLUS_TWO,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control", opponentsCreature(1), opponentsCreature(2), opponentsCreature(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "exile", target: 1 },
              { kind: "exile", target: 2 },
              { kind: "exile", target: 3 },
            ],
          },
        ],
      },
      resolve: null,
      text: MINUS_TWO,
    },
  ],
});
