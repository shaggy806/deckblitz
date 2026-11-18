import { defineCard } from "../define.js";

// Rulings:
//   If another player gains control of the tokens created this way, the ability that causes you to
//     sacrifice them will still trigger. However, any tokens you no longer control can't be
//     sacrificed and will remain on the battlefield.
//   If, for any reason, an Aura token that would be created this way can't be attached to Stangg
//     Twin, that token isn't created. If an Equipment token that can't be attached to Stangg Twin
//     would be created, that token enters the battlefield unattached.
//   If a replacement effect causes the created tokens to have different characteristics or causes
//     additional tokens to be created this way, those tokens will still be sacrificed at the
//     beginning of the next end step.

const TEXT =
  "Whenever Stangg attacks, create Stangg Twin, a legendary 3/4 red and green Human Warrior creature token. It enters tapped and attacking. For each Aura and Equipment attached to Stangg, create a token that's a copy of it attached to Stangg Twin. Sacrifice all tokens created this way at the beginning of the next end step.";

// One delayed ability (rule 603.7) over every token this resolution made,
// remembered as it's set up (603.7c): a replacement's extras included, and
// only those you still control are sacrificed (the rulings).
export default defineCard({
  name: "Stangg, Echo Warrior",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Stangg Twin", count: 1, tapped: true, attacking: "choose" },
          {
            kind: "create-token-copy",
            of: { attachmentsOf: "source" },
            ofMatching: { subtypes: ["Aura", "Equipment"] },
            count: 1,
            who: "you",
            attachedTo: "created",
          },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            remember: { tokens: { set: { thisWay: "created" } } },
            effect: { kind: "sacrifice-all", who: "you", filter: { inSet: { remembered: "tokens" } } },
            text: "Sacrifice all tokens created this way.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
