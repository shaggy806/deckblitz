import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// EDHREC rank 10302. Secrets of Strixhaven Commander.
//
// A layer-1 copy until the cleanup step (Impossible Man's `become-copy`),
// with myriad as one of its copiable values (rule 707.9b) — so myriad's token
// copies of Muddle have it too, and, never declared as attackers, don't fire
// it (the rulings). While a copy, Muddle has none of its own abilities; one
// already on the stack still resolves (the ruling). "Up to one": with no
// target, nothing happens; with one gone illegal, the ability does nothing.
const TEXT =
  "Whenever you cast an instant or sorcery spell, Muddle becomes a copy of up to one target nonlegendary creature you control until end of turn, except it has myriad. (Whenever it attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)";

export default defineCard({
  name: "Muddle, the Ever-Changing",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Otter", "Shapeshifter"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", whose: "you", filter: { type: "creature", notSupertype: "legendary" } },
        },
      ],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "end-of-turn",
        exceptions: { triggered: [myriad()] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
