import { defineCard } from "../define.js";

// EDHREC rank 1902.
//
// Rulings:
//   If you gain control of an instant or sorcery spell with Commandeer, it will still be put into
//   its owner's graveyard when it resolves.
//   You may change any of the targeted spell's targets. If you change a target, you must choose a
//   legal target for the spell. If you can't, you must leave the target the same.
//   If the targeted spell has a triggered ability that copies it (for example, replicate or storm),
//   the copies will be controlled by the player who cast that spell.
//   After Commandeer resolves, you control the targeted spell. Any instance of "you" in that
//   spell's text now refers to you, "an opponent" refers to one of your opponents, and so on. The
//   change of control happens before new targets are chosen.
//   If you Commandeer a spell for which buyback has been paid, the card returns to its owner's hand.
const ALT_TEXT = "You may exile two blue cards from your hand rather than pay this spell's mana cost.";
const EFFECT_TEXT =
  "Gain control of target noncreature spell. You may choose new targets for it. " +
  "(If that spell is an artifact, enchantment, or planeswalker, the permanent enters under your control.)";

export default defineCard({
  name: "Commandeer",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${ALT_TEXT}\n${EFFECT_TEXT}`,
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["U"] }, count: 2, text: "two blue cards" } },
  targets: ["noncreature-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control-spell", target: 0 },
      { kind: "change-targets", target: 0, how: "choose-new" },
    ],
  },
});
