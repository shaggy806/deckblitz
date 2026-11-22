import { defineCard } from "../define.js";

// EDHREC rank 20212. The life is lost as part of entering (rule 614.1c), by
// the player it enters under (the ruling: a Lich someone takes leaves their
// life alone). "Whenever you're dealt damage" fires once for damage dealt at
// once, so its permanents are sacrificed together (the ruling); "if you
// can't" is fewer nontoken permanents than that many, all of them then
// sacrificed before the loss. The draw is a replacement, so two Liches still
// draw once a life (the ruling); the last ability loses even with life above
// 0, but a "can't lose" (Platinum Angel) stops it (the rulings).
const ENTER_TEXT = "As this enchantment enters, you lose life equal to your life total.";
const NO_LOSS_TEXT = "You don't lose the game for having 0 or less life.";
const GAIN_TEXT = "If you would gain life, draw that many cards instead.";
const DAMAGE_TEXT = "Whenever you're dealt damage, sacrifice that many nontoken permanents. If you can't, you lose the game.";
const DIES_TEXT = "When this enchantment is put into a graveyard from the battlefield, you lose the game.";

const SACRIFICE = {
  kind: "sacrifice",
  who: "you",
  filter: { token: false },
  count: { triggerValue: true },
} as const;

export default defineCard({
  name: "Lich",
  manaCost: "{B}{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${NO_LOSS_TEXT}\n${GAIN_TEXT}\n${DAMAGE_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", asEnters: { loseLife: { lifeTotal: "you" } } },
      text: ENTER_TEXT,
    },
    { affects: { scope: "self" }, prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }], text: NO_LOSS_TEXT },
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", instead: { effect: { kind: "draw", amount: "x" } } },
      text: GAIN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "amounts",
          left: { countOf: { token: false, controlledBy: "you" } },
          op: "gte",
          right: { triggerValue: true },
        },
        then: SACRIFICE,
        else: { kind: "sequence", effects: [SACRIFICE, { kind: "lose-game" }] },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "lose-game" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
