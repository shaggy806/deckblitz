import { defineCard } from "../define.js";

// Rulings:
//   Horobi's Whisper can target a creature even if you don't control a Swamp, but the spell does
//     nothing.
//   A card with a splice ability can't be spliced onto itself because the spell is on the stack (and
//     not in your hand) when you reveal the cards you want to splice onto it.
//   You choose all targets for the spell after revealing cards you want to splice, including any
//     targets required by the text of any of those cards. You may choose a different target for each
//     instance of the word "target" on the resulting spell.

export default defineCard({
  name: "Horobi's Whisper",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: {
    onto: "arcane",
    cost: "",
    also: { text: "Exile four cards from your graveyard", exileFromGraveyard: { count: 4 } },
  },
  text: "If you control a Swamp, destroy target nonblack creature.\nSplice onto Arcane—Exile four cards from your graveyard. (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["nonblack-creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
    then: { kind: "destroy", target: 0 },
  },
});
