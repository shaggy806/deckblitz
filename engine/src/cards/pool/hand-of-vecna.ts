import { defineCard } from "../define.js";

const COMBAT =
  "At the beginning of combat on your turn, equipped creature or a creature you control named Vecna gets +X/+X until end of turn, where X is the number of cards in your hand.";

export default defineCard({
  name: "Hand of Vecna",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  supertypes: ["legendary"],
  subtypes: ["Equipment"],
  text: `${COMBAT}\nEquip—Pay 1 life for each card in your hand.\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      // Not a target: which one is chosen as it resolves (the ruling, with
      // Vecna and another equipped creature both there).
      effect: {
        kind: "choose-permanents",
        filter: {
          type: "creature",
          anyOf: [{ hostOfSource: true }, { hasName: "Vecna", controlledBy: "you" }],
        },
        min: 1,
        upTo: 1,
        then: {
          kind: "modify-pt",
          target: 0,
          power: { cardsInHand: "you" },
          toughness: { cardsInHand: "you" },
          duration: "end-of-turn",
        },
        prompt: "Choose the equipped creature or a creature you control named Vecna",
      },
      resolve: null,
      text: COMBAT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: { each: 1, per: "card-in-hand" } },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip—Pay 1 life for each card in your hand.",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
