import { defineCard } from "../define.js";

// Torment. The two abilities are linked (rule 607.2a): the leaving trigger finds
// the cards this stint exiled, though the creature has left.

const ENTER_TEXT = "When this creature enters, exile up to two target cards from a single graveyard.";
const LEAVES_TEXT = "When this creature leaves the battlefield, return the exiled cards to their owner's graveyard.";

export default defineCard({
  name: "Gravegouger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2, sameController: true }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "graveyard" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
