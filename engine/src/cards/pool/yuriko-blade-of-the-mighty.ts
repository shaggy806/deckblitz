import { defineCard } from "../define.js";

export default defineCard({
  name: "Yuriko, Blade of the Mighty",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 3,
  text: "During combat, players can't cast spells or activate abilities that aren't mana abilities.\nWhenever a creature you control attacks a player alone, it gains double strike until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-structure", duringCombat: true },
      prohibits: [{ act: "cast", who: "each-player" }, { act: "activate", who: "each-player", except: ["mana"], anyZone: true }],
      text: "During combat, players can't cast spells or activate abilities that aren't mana abilities.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", defender: "player" },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature you control attacks a player alone, it gains double strike until end of turn.",
    },
  ],
});
