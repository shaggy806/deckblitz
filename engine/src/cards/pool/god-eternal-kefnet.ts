import { defineCard } from "../define.js";

// EDHREC rank 8348.
//
// - "You may reveal the first card you draw each turn as you draw it" is the
//   draw trigger's `revealsDrawn`: the first card drawn on any turn, whatever
//   it is, is asked about through the `miracle-reveal` question before the
//   trigger is placed, so the question tells no one what was drawn; kept
//   hidden, or revealed and not an instant or sorcery, nothing happens (its
//   rulings: any turn, not just yours; you don't have to reveal it). Two
//   Kefnets ask twice and copy it twice, each copy {2} less (the ruling).
// - The copy is created in and cast from your hand, of the card as it last
//   existed if it has left your hand since; it's cast as the trigger
//   resolves or not at all, a sorcery whatever the turn or step (rule
//   608.2g, its rulings). The reduction is generic mana off what's paid
//   (rule 601.2f); its mana value is unchanged.
// - The leaves trigger is God-Eternal Oketra's: "it" is the card found where
//   it went, and only there (rule 400.7); third from the top falls to the
//   bottom of a library of two or fewer (its ruling).
const REVEAL_TEXT =
  "You may reveal the first card you draw each turn as you draw it. Whenever you reveal an instant or sorcery " +
  "card this way, copy that card and you may cast the copy. That copy costs {2} less to cast.";
const LEAVE_TEXT =
  "When God-Eternal Kefnet dies or is put into exile from the battlefield, you may put it into its " +
  "owner's library third from the top.";

export default defineCard({
  name: "God-Eternal Kefnet",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "God"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${REVEAL_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 1 },
      revealsDrawn: { filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "cast-now", target: "trigger-object", copies: 1, copiesIn: "hand", reduce: 2 },
      resolve: null,
      text: REVEAL_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard", "exile"] },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put God-Eternal Kefnet into its owner's library third from the top?",
        effect: { kind: "put-on-library", target: "trigger-object", position: { fromTop: 3 } },
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
