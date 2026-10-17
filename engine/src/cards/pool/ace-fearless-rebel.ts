import { defineCard } from "../define.js";

// Selfcraft Mechan's "you may sacrifice an artifact. When you do, …". The
// reflexive ability's one slot is optional: with no target chosen Ace still
// gets the counter (and fights nothing); with one chosen that's illegal as it
// resolves, the ability does nothing at all (the ruling, rule 608.2b).
const NITRO_TEXT =
  "Nitro-9 — Whenever Ace attacks, you may sacrifice an artifact. When you do, put a +1/+1 counter on Ace, then it fights up to one target creature defending player controls.";

export default defineCard({
  name: "Ace, Fearless Rebel",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${NITRO_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "optional", of: "creature-defending-player-controls" }],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
              { kind: "fight", a: "source", b: 0 },
            ],
          },
          text: "When you do, put a +1/+1 counter on Ace, then it fights up to one target creature defending player controls.",
        },
      },
      resolve: null,
      text: NITRO_TEXT,
    },
  ],
});
