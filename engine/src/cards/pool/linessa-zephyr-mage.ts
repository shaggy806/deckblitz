import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

const GRANDEUR_TEXT =
  "Grandeur — Discard another card named Linessa, Zephyr Mage: Target player returns a creature they control to its owner's hand, then repeats this process for an artifact, an enchantment, and a land.";

// EDHREC rank 27873. One at a time, in order: an artifact creature can't count
// for both (the ruling).
const step = (filter: CardFilter, what: string) =>
  ({
    kind: "choose-permanents",
    chooser: { target: 0 },
    controlledByPlayer: { target: 0 },
    filter,
    min: 1,
    upTo: 1,
    then: { kind: "return-to-hand", target: 0 },
    prompt: `Return ${what} you control to its owner's hand.`,
  }) as const;

export default defineCard({
  name: "Linessa, Zephyr Mage",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `{X}{U}{U}, {T}: Return target creature with mana value X to its owner's hand.\n${GRANDEUR_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{U}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "eq", n: "x" } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{X}{U}{U}, {T}: Return target creature with mana value X to its owner's hand.",
    },
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { name: "Linessa, Zephyr Mage" } } },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          step({ type: "creature" }, "a creature"),
          step({ type: "artifact" }, "an artifact"),
          step({ type: "enchantment" }, "an enchantment"),
          step({ type: "land" }, "a land"),
        ],
      },
      resolve: null,
      text: GRANDEUR_TEXT,
    },
  ],
});
