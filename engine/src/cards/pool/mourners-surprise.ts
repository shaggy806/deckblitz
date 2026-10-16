import { defineCard } from "../define.js";

// EDHREC rank 13894.
//
// The target is optional: with none chosen the spell still makes its
// Mercenary; with one chosen that has become illegal, the spell doesn't
// resolve at all and makes nothing (the ruling, rule 608.2b).
export default defineCard({
  name: "Mourner's Surprise",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: 'Return up to one target creature card from your graveyard to your hand. Create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."',
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "create-token", token: "Mercenary Token", count: 1 },
    ],
  },
});
