import { defineCard } from "../define.js";

// Tamiyo, Inquisitive Student's back face. The −3's colour check reads the
// returned card.
const WATCH = "Until your next turn, whenever a creature attacks you or a planeswalker you control, it gets -1/-0 until end of turn.";
const PLUS = `+2: ${WATCH}`;
const MINUS =
  "−3: Return target instant or sorcery card from your graveyard to your hand. If it's a green card, add one mana of any color.";
const EMBLEM = "You have no maximum hand size.";
const ULT = `−7: Draw cards equal to half the number of cards in your library, rounded up. You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Tamiyo, Seasoned Scholar",
  art: "https://cards.scryfall.io/art_crop/back/2/a/2a717b98-cdac-416d-bf6c-f6b6638e65d1.jpg",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tamiyo"],
  loyalty: 2,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "attacks", who: "any", filter: { type: "creature" }, attackingYou: true },
          until: "until-your-next-turn",
        },
        effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: 0, duration: "end-of-turn" },
        text: WATCH,
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { colors: ["G"] } },
            then: { kind: "add-mana", mana: "any-color", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { half: { librarySize: "you" }, round: "up" } },
          {
            kind: "create-emblem",
            text: EMBLEM,
            static: { affects: { scope: "self" }, noMaxHandSize: true, text: EMBLEM },
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
  faces: ["Tamiyo, Inquisitive Student", "Tamiyo, Seasoned Scholar"],
  transform: true,
});
