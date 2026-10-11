import { defineCard } from "../define.js";

// EDHREC rank 10572. Satya, Aetherflux Genius's tapped-and-attacking token
// copy (its controller chooses what it attacks, rule 508.4) with Miirym's
// "isn't legendary" and an added creature type as copy exceptions (rule
// 707.9b), then a real delayed triggered ability sacrificing the token this
// resolution made (Urabrask's Forge — rule 603.7). An illegal target makes
// nothing.

const ATTACK_TEXT =
  "Whenever Loki attacks, create a tapped and attacking token that's a copy of another target Villain you control, except it isn't legendary and it's an Illusion in addition to its other types. Sacrifice that token at the beginning of the next end step.";
const DAMAGE_TEXT = "Whenever one or more Villains you control deal combat damage to a player, draw a card.";

export default defineCard({
  name: "Loki, the Deceiver",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Sorcerer", "Villain"],
  power: 4,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Villain" } } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            tapped: true,
            attacking: "choose",
            notLegendary: true,
            exceptions: { addSubtypes: ["Illusion"] },
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice that token at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Villain" }, combat: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
