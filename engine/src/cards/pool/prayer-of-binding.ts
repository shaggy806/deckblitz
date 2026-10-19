import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 16614.
//
// Liminal Hold's O-Ring, word for word, with flash. Nothing is exiled if the
// enchantment has left before its trigger resolves (the ruling); with no
// target chosen the life is still gained, and a target that has become
// illegal fizzles the whole ability, life included (the ruling). A token
// exiled this way ceases to exist and never comes back.
const ENTER_TEXT =
  "When this enchantment enters, exile up to one target nonland permanent an opponent controls until this enchantment leaves the battlefield. You gain 2 life.";

export default defineCard({
  name: "Prayer of Binding",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "nonland-permanent-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
});
