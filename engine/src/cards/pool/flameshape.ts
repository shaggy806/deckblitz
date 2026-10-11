import { defineCard } from "../define.js";

// Gandalf, Goblins' Bane's Adventure (`gandalf-goblins-bane.ts`).
//
// Rulings:
//   [2026-06-29] You pay all costs and follow all timing rules for cards exiled with Flameshape.
//     For example, if an exiled card is a land card, you may play it only during your main phase
//     while the stack is empty and only if you have an available land play remaining.
//   [2026-06-29] You must control a Wizard to cast spells exiled by Flameshape, but losing control
//     of your last Wizard while a spell is on the stack will not prevent the spells from resolving.
//
// Exiled face down for as long as they remain exiled (Expensive Taste's
// impulse), the permission gated live on controlling a Wizard (`gate`, as
// Neriv's is on attacking with a commander) — checked as each one is played,
// not again once it's on the stack.

export default defineCard({
  name: "Flameshape",
  art: "https://cards.scryfall.io/art_crop/back/9/b/9b0d29a1-7da9-4fb3-8536-8ff8d8acae0b.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Look at the top two cards of your library and exile them face down. For as long as they remain exiled, you may play them if you control a Wizard.",
  effect: {
    kind: "impulse-exile",
    amount: 2,
    duration: "while-exiled",
    faceDown: true,
    gate: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
  },
  faces: ["Gandalf, Goblins' Bane", "Flameshape"],
  adventure: true,
});
