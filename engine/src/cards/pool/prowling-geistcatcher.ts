import { defineCard } from "../define.js";

// EDHREC rank 11341. The sacrificed creature's card is exiled linked to this
// (rule 607.2a) — from its owner's graveyard, whoever owns it (the ruling); a
// token ceases to exist in exile and only adds the counter. The leaves trigger
// *puts* every linked card onto the battlefield under its controller's control
// (`return-exiled-by-source`'s `under: "you"`), not their owners'.
//
// Rulings:
//   If you sacrifice a nontoken creature you control but don't own, Prowling Geistcatcher will still
//     cause you to exile that card from its owner's graveyard. The card will be returned to the
//     battlefield under your control with the rest of the exiled cards.
//   If you sacrifice a creature token you control but don't own, you will still put a +1/+1 counter
//     on Prowling Geistcatcher.

const SAC_TEXT =
  "Whenever you sacrifice another creature, exile it. If that creature was a token, put a +1/+1 counter on this creature.";
const LEAVES_TEXT = "When this creature leaves the battlefield, return each card exiled with it to the battlefield under your control.";

export default defineCard({
  name: "Prowling Geistcatcher",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 4,
  text: `${SAC_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object", linked: true },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { token: true } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield", under: "you" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
