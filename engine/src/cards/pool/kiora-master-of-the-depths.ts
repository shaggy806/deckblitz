import { defineCard } from "../define.js";

// EDHREC rank 9061.
//
// +1's two slots are each optional (the ruling: activate it with no targets
// just for the loyalty), and are two instances of "target", so a land
// creature may be both. −8 makes the emblem first, so the three Octopuses
// trigger it as they enter (the ruling).
//
// Rulings:
//   [2015-08-25] You will have the emblem by the time the Octopus creature tokens enter the
//     battlefield—they'll be looking to fight!
//   [2015-08-25] You can activate Kiora's first ability with no targets just to put a loyalty
//     counter on her.
//   [2015-08-25] With Kiora's second ability, you could put no cards, a creature card, a land
//     card, or a creature card and a land card into your hand.
const PLUS_TEXT = "+1: Untap up to one target creature and up to one target land.";
const MINUS_TEXT =
  "−2: Reveal the top four cards of your library. You may put a creature card and/or a land card from among them into your hand. Put the rest into your graveyard.";
const EMBLEM = "Whenever a creature you control enters, you may have it fight target creature.";
const ULT_TEXT = `−8: You get an emblem with "${EMBLEM}" Then create three 8/8 blue Octopus creature tokens.`;

export default defineCard({
  name: "Kiora, Master of the Depths",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kiora"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: "land" },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        secondPick: { filter: { type: "land" }, min: 0, max: 1, destination: "hand" },
        leftover: "graveyard",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-emblem",
            text: EMBLEM,
            triggered: [
              {
                trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
                targets: ["creature"],
                effect: {
                  kind: "may",
                  prompt: "Have the creature that entered fight the target creature?",
                  effect: { kind: "fight", a: "trigger-object", b: 0 },
                },
                resolve: null,
                text: EMBLEM,
              },
            ],
          },
          { kind: "create-token", token: "Octopus Token", count: 3 },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
