import { defineCard } from "../define.js";

// EDHREC rank 27152. Death's Duet's two targets, behind a rhystic `unless`
// whose {X} is the spell's X.

const RETURN = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;

export default defineCard({
  name: "Soul Strings",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return two target creature cards from your graveyard to your hand unless any player pays {X}.",
  targets: [RETURN, { kind: "other", of: RETURN, than: { slots: [0] } }],
  effect: {
    kind: "unless",
    chooser: "any-player",
    options: [{ payGeneric: "x", text: "Pay {X}" }],
    otherwise: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "return-to-hand", target: 0, from: "graveyard" },
        { kind: "return-to-hand", target: 1, from: "graveyard" },
      ],
    },
  },
});
