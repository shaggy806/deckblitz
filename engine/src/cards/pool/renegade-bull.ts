import { defineCard } from "../define.js";

// EDHREC rank 13945. Secrets of Strixhaven Commander.
//
// "That spell's mana value" is the trigger object's on the stack, {X} as
// chosen — or as it last was there, if it was countered first (the rulings).
// The attack trigger is Narset, Enlightened Exile's: the copy is cast while
// the ability resolves or not at all, X at 0, timing ignored (the rulings);
// "up to one" — with no target, nothing happens.
const PUMP_TEXT =
  "Whenever you cast an instant or sorcery spell, this creature gets +X/+0 until end of turn, where X is that spell's mana value.";
const ATTACK_TEXT =
  "Whenever this creature attacks, exile up to one target instant or sorcery card from your graveyard and copy it. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Renegade Bull",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ox"],
  power: 0,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${PUMP_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaValueOf: "trigger-object" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
