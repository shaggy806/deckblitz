import { defineCard } from "../define.js";

// EDHREC rank 8777.
//
// The life is counted after the tokens are made, so they count. The spell
// exiles itself as it resolves (`exileOnResolve` — Reunion of the House); a
// countered one goes to the graveyard, to be cast again. "You may cast this
// card from your graveyard" is Gravecrawler's permission with no condition
// (Haakon's `ALWAYS`): normal costs and timing (the ruling).
const ALWAYS = { kind: "controls", filter: {}, atLeast: 0 } as const;

export default defineCard({
  name: "Their Number Is Legion",
  manaCost: "{X}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Create X tapped 2/2 black Necron Warrior artifact creature tokens, then you gain life equal to the number of artifacts you control. Exile Their Number Is Legion.\nYou may cast this card from your graveyard.",
  exileOnResolve: true,
  castFromGraveyardIf: ALWAYS,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Necron Warrior Token", count: "x", tapped: true },
      { kind: "gain-life", amount: { countOf: { type: "artifact", controlledBy: "you" } } },
    ],
  },
});
