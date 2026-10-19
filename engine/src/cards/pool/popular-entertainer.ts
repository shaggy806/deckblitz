import { defineCard } from "../define.js";

// Rulings:
//   [2022-06-10] If a card refers to a commander creature you own, a Background won't usually be
//     counted or included for that effect. If another spell or ability causes your Background to
//     become a creature, however, it will be included.
//   [2022-06-10] If you control a Background that grants an ability to commander creatures you
//     own, and you own more than one commander creature, each of them will have that ability.
//
// The granted trigger is Alela, Cunning Conqueror's shape: once per player dealt combat damage
// by one or more creatures its controller controls, that player the "trigger-player".

const GRANTED_TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, goad target creature that player controls.";
const TEXT = `Commander creatures you own have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Popular Entertainer",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: `${TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
          targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
          effect: { kind: "goad", target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
