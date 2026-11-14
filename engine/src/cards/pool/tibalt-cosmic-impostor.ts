import { defineCard } from "../define.js";

// Kaldheim (KHM). The back face of Valki, God of Lies.
//
// The emblem is part of Tibalt entering (rule 614.1c), not a trigger. It lets
// its owner play the cards exiled with *that* Tibalt (rule 607.2a), even after
// it leaves; another Tibalt is a new object with an emblem of its own (the
// rulings). Every card its loyalty abilities exile is exiled face up, with it.
// The playing follows the normal rules: costs paid, timing, a land drop.
const EMBLEM_TEXT =
  "You may play cards exiled with Tibalt, Cosmic Impostor, and you may spend mana as though it were mana of any color to cast those spells.";
const ENTER_TEXT = `As Tibalt enters, you get an emblem with "${EMBLEM_TEXT}"`;
const PLUS_TEXT = "+2: Exile the top card of each player's library.";
const MINUS_TEXT = "−3: Exile target artifact or creature.";
const ULT_TEXT = "−8: Exile all graveyards. Add {R}{R}{R}.";

export default defineCard({
  name: "Tibalt, Cosmic Impostor",
  art: "https://cards.scryfall.io/art_crop/back/e/a/ea7e4c65-b4c4-4795-9475-3cba71c50ea5.jpg",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tibalt"],
  loyalty: 5,
  text: `${ENTER_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEntersEffect: {
          kind: "create-emblem",
          text: EMBLEM_TEXT,
          linkedToSource: true,
          static: {
            affects: { scope: "self" },
            mayPlay: { from: "exile", play: true, filter: {}, linked: true, spendAs: "any-color" },
            text: EMBLEM_TEXT,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-player", amount: 1, linked: true },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["artifact-or-creature"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "each-player", linked: true },
          { kind: "add-mana", mana: "R", amount: 3 },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
  faces: ["Valki, God of Lies", "Tibalt, Cosmic Impostor"],
});
