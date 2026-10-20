import { defineCard } from "../define.js";

// EDHREC rank 7809. A daybound werewolf; the back face is Wildsong Howler.
// "If it's a Wolf or Werewolf" asks about the creature put onto the
// battlefield this way, as it is there (Hakbal of the Surging Soul's
// look-and-choose from the hand, then a `this-way` condition on it).
const PIPER_TEXT =
  "{1}{G}, {T}: You may put a creature card from your hand onto the battlefield. If it's a Wolf or Werewolf, untap this creature. Activate only as a sorcery.";

export default defineCard({
  name: "Howlpack Piper",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 2,
  keywords: ["daybound"],
  cantBeCountered: true,
  text: `This spell can't be countered.\n${PIPER_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            filter: { type: "creature" },
            destination: "battlefield",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: {
              kind: "this-way",
              what: "put-onto-battlefield",
              filter: { subtypes: ["Wolf", "Werewolf"] },
            },
            then: { kind: "untap", target: "source" },
          },
        ],
      },
      resolve: null,
      text: PIPER_TEXT,
      sorcerySpeed: true,
    },
  ],
  faces: ["Howlpack Piper", "Wildsong Howler"],
  transform: true,
});
