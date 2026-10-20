import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 9691. Any Angel you control dying triggers it,
// not only the token (the ruling); "each other player" is each opponent.
const ENTER_TEXT = "When this enchantment enters, create a 4/4 white Angel creature token with flying and vigilance.";
const DIES_TEXT = "Whenever an Angel you control dies, each other player sacrifices a creature of their choice.";

export default defineCard({
  name: "Rampage of the Valkyries",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Vigilant Angel Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Angel" } },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
