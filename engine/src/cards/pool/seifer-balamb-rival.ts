import { defineCard } from "../define.js";

export default defineCard({
  name: "Seifer, Balamb Rival",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Mercenary"],
  power: 4,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike\nWhenever you attack a player, goad target creature that player controls.\nWhenever a creature attacking one of your opponents becomes blocked by two or more creatures, that attacking creature gains deathtouch until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "goad", target: 0 },
      resolve: null,
      text: "Whenever you attack a player, goad target creature that player controls.",
    },
    {
      trigger: {
        on: "becomes-blocked",
        who: "any",
        filter: { type: "creature" },
        attackedPlayer: "opponent",
        blockers: { atLeast: 2 },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature attacking one of your opponents becomes blocked by two or more creatures, that attacking creature gains deathtouch until end of turn.",
    },
  ],
});
