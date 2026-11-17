import { defineCard } from "../define.js";

// REX. The card the drawing player exiles is exiled with Ian Malcolm (rule
// 607.2a, `linked`), so any player's own exiled card stays linked too — but
// the permission is every player's (`eachPlayer`), during their own turn
// (`yourTurnOnly`), over the linked cards they don't own (`ownedBy:
// "opponent"`, read from the casting player's side), spells only, with mana
// of any type (`spendAs: "any-type"`, rule 609.4b). Ordinary timing applies
// (the first ruling): a sorcery waits for its caster's main phase.
//
// Rulings:
//   [2023-11-10] Players must follow all applicable timing rules for casting spells with the
//     permission granted by Ian Malcolm, Chaotician's last ability. For example, if the spell is a
//     sorcery, it can only be cast during that player's main phase while the stack is empty.
//   [2023-11-10] The six types of mana are white, blue, black, red, green, and colorless. Snow mana
//     is not a type of mana. Ian Malcolm, Chaotician won't let you pay a snow cost using mana
//     produced by a nonsnow source.
//   [2023-11-10] Ian Malcolm, Chaotician's first ability can trigger only once each turn for each
//     player. It doesn't matter if Ian was on the battlefield when the first card was drawn. If you
//     control it when a player draws their second card in a turn, that ability will trigger.

const DRAW_TEXT = "Whenever a player draws their second card each turn, that player exiles the top card of their library.";
const CAST_TEXT =
  "During each player's turn, that player may cast a spell from among the cards they don't own exiled with Ian Malcolm, and mana of any type can be spent to cast it.";

export default defineCard({
  name: "Ian Malcolm, Chaotician",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 2,
  toughness: 2,
  text: `${DRAW_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "any", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1, linked: true },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: CAST_TEXT,
      mayPlay: {
        from: "exile",
        filter: { ownedBy: "opponent" },
        linked: true,
        eachPlayer: true,
        yourTurnOnly: true,
        spendAs: "any-type",
      },
    },
  ],
});
