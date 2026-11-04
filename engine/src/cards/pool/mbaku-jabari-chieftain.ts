import { defineCard } from "../define.js";

// "If that player is the monarch" is an intervening if (rule 603.4), asked again
// as the ability resolves: `of-player` over "that player", the one attacked.

export default defineCard({
  name: "M'Baku, Jabari Chieftain",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Noble", "Warrior"],
  power: 4,
  toughness: 3,
  text: "At the beginning of your end step, if there is no monarch, target opponent becomes the monarch.\nWhenever a creature attacks one of your opponents, if that player is the monarch, that creature gets +1/+1 and gains trample until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "monarch", who: "nobody" },
      targets: ["opponent"],
      effect: { kind: "become-monarch", who: 0 },
      resolve: null,
      text: "At the beginning of your end step, if there is no monarch, target opponent becomes the monarch.",
    },
    {
      trigger: { on: "attacks", who: "any", filter: { type: "creature", attackingOpponent: true } },
      condition: { kind: "of-player", player: "that-player", condition: { kind: "monarch", who: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever a creature attacks one of your opponents, if that player is the monarch, that creature gets +1/+1 and gains trample until end of turn.",
    },
  ],
});
