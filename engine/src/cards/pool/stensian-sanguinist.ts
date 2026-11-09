import { defineCard } from "../define.js";

// EDHREC rank 4206. The watch lasts this combat alone
// (`until: "until-end-of-combat"`), on the targeted creature (`watching`).

const TEXT =
  "Whenever you attack, target creature gains deathtouch until end of turn. Whenever that creature deals combat damage to a player this combat, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)";

export default defineCard({
  name: "Stensian Sanguinist",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "deals-combat-damage-to-player", who: "self" },
              watching: 0,
              until: "until-end-of-combat",
            },
            effect: { kind: "become-prepared", target: "source" },
            text: "This creature becomes prepared.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  prepareSpell: "Exsanguinate",
});
