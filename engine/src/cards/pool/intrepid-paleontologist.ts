import { defineCard } from "../define.js";

// The cast permission is linked to the cards its own exile ability exiled
// (rule 607.2a) and reaches only the Dinosaur creature cards among them that
// you own; a spell cast that way enters with a finality counter.
export default defineCard({
  name: "Intrepid Paleontologist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text:
    "{T}: Add one mana of any color.\n" +
    "{2}: Exile target card from a graveyard.\n" +
    "You may cast Dinosaur creature spells from among cards you own exiled with this creature. If you cast a spell this way, that creature enters with a finality counter on it. (If a creature with a finality counter on it would die, exile it instead.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: "{2}: Exile target card from a graveyard.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "exile",
        linked: true,
        filter: { type: "creature", subtype: "Dinosaur", ownedBy: "you" },
        entersWith: { kind: "finality", amount: 1 },
      },
      text: "You may cast Dinosaur creature spells from among cards you own exiled with this creature. If you cast a spell this way, that creature enters with a finality counter on it.",
    },
  ],
});
