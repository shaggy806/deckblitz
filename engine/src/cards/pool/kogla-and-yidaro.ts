import { defineCard } from "../define.js";

const ENTERS = "When Kogla and Yidaro enters, choose one —";
const DISCARD =
  "{2}{R}{G}, Discard this card: Destroy up to one target artifact or enchantment. Shuffle this card into your library from your graveyard, then draw a card.";

// The hand ability's target is optional, but one chosen and gone illegal
// means it doesn't resolve at all: no shuffle, no card (its ruling).
export default defineCard({
  name: "Kogla and Yidaro",
  manaCost: "{2}{R}{R}{G}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ape", "Dinosaur", "Turtle"],
  power: 7,
  toughness: 7,
  text: `${ENTERS}\n• It gains trample and haste until end of turn.\n• It fights target creature you don't control.\n${DISCARD}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "It gains trample and haste until end of turn.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: "It fights target creature you don't control.",
            targets: ["creature-an-opponent-controls"],
            effect: { kind: "fight", a: "source", b: 0 },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}{G}", tap: false },
      zone: "hand",
      targets: [{ kind: "optional", of: "artifact-or-enchantment" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "shuffle-graveyard-into-library", target: "you", filter: { isSource: true } },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DISCARD,
    },
  ],
});
