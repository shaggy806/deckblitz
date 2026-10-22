import { defineCard } from "../define.js";

// Ice Age. Two delayed triggers set up as the ability resolves (War Barge's
// "when this leaves the battlefield this turn"): one on the Mount leaving,
// sacrificing the creature (only while you still control it — rule 701.21a),
// one on the creature leaving, sacrificing the Mount. The toughness is checked
// only as it's activated and resolves (the ruling): a target grown past 2 by
// then is illegal and nothing happens, and later growth doesn't end anything.

const TEXT =
  "{T}: Target creature you control with toughness 2 or less gets +1/+1 and gains flying until end of turn. When this creature leaves the battlefield this turn, sacrifice that creature. When the creature leaves the battlefield this turn, sacrifice this creature.";

const ANYWHERE = ["graveyard", "exile", "hand", "library", "command"] as const;

export default defineCard({
  name: "Phantasmal Mount",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Horse"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", toughness: { op: "lte", n: 2 } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { leaves: "source", to: ANYWHERE, thisTurn: true },
            effect: { kind: "sacrifice-target", target: 0 },
            text: "When Phantasmal Mount leaves the battlefield this turn, sacrifice that creature.",
          },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ANYWHERE, thisTurn: true },
            effect: { kind: "sacrifice-source" },
            text: "When that creature leaves the battlefield this turn, sacrifice Phantasmal Mount.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
