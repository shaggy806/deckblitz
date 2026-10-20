import { defineCard } from "../define.js";

/** The nightbound back face of Ballista Watcher. "Can't block this turn" is a
 * modifier on the creature dealt damage, so it lasts whichever face the
 * Wielder shows later (the ruling); damage prevented isn't dealt this way. */
const PING_TEXT =
  "{2}{R}: This creature deals 1 damage to any target. A creature dealt damage this way can't block this turn.";

export default defineCard({
  name: "Ballista Wielder",
  art: "https://cards.scryfall.io/art_crop/back/6/3/63d96c52-66ce-4b46-9a0b-7cd9a43f9253.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 5,
  keywords: ["nightbound"],
  text: `${PING_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "damage-dealt-this-way", to: 0 },
                { kind: "target", index: 0, filter: { type: "creature" } },
              ],
            },
            then: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          },
        ],
      },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  faces: ["Ballista Watcher", "Ballista Wielder"],
  transform: true,
});
