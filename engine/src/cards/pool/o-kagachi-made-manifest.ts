import { defineCard } from "../define.js";

// The Kami War's back face. "Is all colors" is its colour, defined on the face
// (rule 604.3 — a characteristic-defining ability). The attack trigger is
// Neyam Shai Murad's shape: `chooser: "that-player"` in an attack trigger is
// the trigger player — the defending player (the player attacked, or the
// controller of the planeswalker attacked). The chosen card is the `then`'s
// target 0, read in your hand for its mana value; with no nonland card in
// your graveyard nothing is chosen and the creature gets nothing.

const ATTACK_TEXT =
  "Whenever this creature attacks, defending player chooses a nonland card in your graveyard. Return that card to your hand. This creature gets +X/+0 until end of turn, where X is the mana value of that card.";

export default defineCard({
  name: "O-Kagachi Made Manifest",
  art: "https://cards.scryfall.io/art_crop/back/3/6/36052532-5028-43a8-9fc4-56221ec867fd.jpg",
  colors: ["W", "U", "B", "R", "G"],
  types: ["enchantment", "creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `O-Kagachi Made Manifest is all colors.\nFlying, trample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "graveyard",
        chooser: "that-player",
        min: 1,
        max: 1,
        filter: { notTypes: ["land"] },
        destination: "hand",
        leftover: "stay",
        then: {
          kind: "modify-pt",
          target: "source",
          power: { manaValueOf: 0 },
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["The Kami War", "O-Kagachi Made Manifest"],
  transform: true,
});
