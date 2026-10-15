import { defineCard } from "../define.js";

// EDHREC rank 12174.
// Rulings:
//   [2025-06-06] Exdeath, Void Warlock's last ability checks your graveyard at the moment it would
//     trigger to see if you have six or more permanent cards in your graveyard. If you don't, the
//     ability won't trigger at all. If it does trigger, the ability will check again as it tries
//     to resolve. If you don't have six or more permanent cards in your graveyard at that time,
//     the ability won't resolve and none of its effects will happen.
//   [2025-06-06] The mana value of a nonmodal double-faced card is the mana value of its front
//     face, no matter which face is up.

const ENTER_TEXT = "When Exdeath enters, you gain 3 life.";
const TRANSFORM_TEXT =
  "At the beginning of your end step, if there are six or more permanent cards in your graveyard, transform Exdeath.";

export default defineCard({
  name: "Exdeath, Void Warlock",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Warlock"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // An intervening-if (rule 603.4), checked as it triggers and again as
      // it resolves (the ruling). A permanent card is one that isn't an
      // instant or a sorcery (Diamond Weapon's filter).
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "cards-in-graveyard", atLeast: 6, filter: { notTypes: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Exdeath, Void Warlock", "Neo Exdeath, Dimension's End"],
  transform: true,
});
