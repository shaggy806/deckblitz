import { defineCard } from "../define.js";

const IMPRINT_TEXT = "Imprint — When this creature enters, you may exile target nontoken creature.";
const STATIC_TEXT =
  "As long as a card exiled with this creature is a creature card, this creature has the power, toughness, and " +
  "creature types of the last creature card exiled with it. It's still a Shapeshifter.";

export default defineCard({
  name: "Duplicant",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 4,
  text: `${IMPRINT_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", token: false } }],
      effect: {
        kind: "may",
        prompt: "Exile target nontoken creature?",
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      takesLastExiledCard: { filter: { type: "creature" }, keepCreatureTypes: ["Shapeshifter"] },
      text: STATIC_TEXT,
    },
  ],
});
