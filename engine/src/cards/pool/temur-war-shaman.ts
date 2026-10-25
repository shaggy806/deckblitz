import { defineCard } from "../define.js";

// EDHREC rank 8320.
//
// Rulings:
//   [2014-11-24] There are no cards in the Fate Reforged set that would turn a face-down instant
//     or sorcery card on the battlefield face up, but some older cards can try to do this. If
//     something tries to turn a face-down instant or sorcery card on the battlefield face up,
//     reveal that card to show all players it's an instant or sorcery card. The permanent remains
//     on the battlefield face down. Abilities that trigger when a permanent turns face up won't
//     trigger, because even though you revealed the card, it never turned face up.
//   [2014-11-24] Because the permanent is on the battlefield both before and after it's turned
//     face up, turning a permanent face up doesn't cause any enters-the-battlefield abilities to
//     trigger.

const FIGHT_TEXT =
  "Whenever a permanent you control is turned face up, if it's a creature, you may have it fight target creature you don't control.";

export default defineCard({
  name: "Temur War Shaman",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 4,
  toughness: 5,
  text: `When this creature enters, manifest the top card of your library. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)\n${FIGHT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: "When this creature enters, manifest the top card of your library.",
    },
    {
      // The "if" as it triggers (the filter) and again as it resolves (the
      // conditional) — rule 603.4. "It" is the permanent turned face up.
      trigger: { on: "turned-face-up", who: "you-control", filter: { type: "creature" } },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { type: "creature" } },
        then: {
          kind: "may",
          prompt: "Have it fight target creature you don't control?",
          effect: { kind: "fight", a: "trigger-object", b: 0 },
        },
      },
      resolve: null,
      text: FIGHT_TEXT,
    },
  ],
});
