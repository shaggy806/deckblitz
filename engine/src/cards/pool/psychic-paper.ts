import { defineCard } from "../define.js";

// EDHREC rank 6528.
//
// - The choices are made as it becomes attached, however it does (equipped,
//   or attached by another effect), by its controller, and kept on it: a
//   name a creature card has, and a creature type — not a card type or a
//   supertype (the ruling). Each attaching chooses again; the last stand.
// - The equipped creature's name is the last chosen one, and its creature
//   types are just the last chosen one (rule 205.1a — its other subtypes
//   stay). Nothing changes them while nothing has been chosen.

const AS_ATTACHED_TEXT =
  "As this Equipment becomes attached to a creature, choose a creature card name and a creature type.";
const STATIC_TEXT =
  "Equipped creature has ward {1}, it can't be blocked, and its name and creature type are the last chosen name and creature type.";

export default defineCard({
  name: "Psychic Paper",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${AS_ATTACHED_TEXT}\n${STATIC_TEXT}\nEquip {2}`,
  asBecomesAttached: {
    effect: {
      kind: "choose-card-name",
      filter: { types: ["creature"] },
      remember: true,
      then: {
        kind: "choose-creature-type",
        prompt: "Choose a creature type for the equipped creature",
        remember: true,
        then: { kind: "sequence", effects: [] },
      },
    },
  },
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["unblockable"],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{1}" } },
          resolve: null,
          text: "Ward {1}",
        },
      ],
      setsChosenName: true,
      setsChosenCreatureType: true,
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
