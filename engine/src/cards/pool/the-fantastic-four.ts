import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "When The Fantastic Four enter and whenever you cast a spell with power, toughness, or mana value 4, choose one that hasn't been chosen this turn.";
const WALL_MODE = "Create a 0/4 colorless Wall creature token with defender.";
const DAMAGE_MODE = "The Fantastic Four deal 3 damage to each opponent.";
const COUNTERS_MODE = "Put two +1/+1 counters on target creature.";
const DRAW_MODE = "Draw a card.";
const TEXT = `${TRIGGER_TEXT}\n• ${WALL_MODE}\n• ${DAMAGE_MODE}\n• ${COUNTERS_MODE}\n• ${DRAW_MODE}`;

// Breeches, Eager Pillager's announced "hasn't been chosen this turn" modal;
// the two trigger events are one ability (`sameAbilityAs`), so they share
// one tally.
const MODES: EffectSpec = {
  kind: "modal",
  announced: true,
  notChosenThisTurn: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    { text: WALL_MODE, effect: { kind: "create-token", token: "Wall Token (The Fantastic Four)", count: 1 } },
    { text: DAMAGE_MODE, effect: { kind: "damage", amount: 3, who: "each-opponent" } },
    {
      text: COUNTERS_MODE,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
    },
    { text: DRAW_MODE, effect: { kind: "draw", amount: 1 } },
  ],
};

export default defineCard({
  name: "The Fantastic Four",
  manaCost: "{R}{G}{W}{U}",
  colors: ["W", "U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          anyOf: [
            { power: { op: "eq", n: 4 } },
            { toughness: { op: "eq", n: 4 } },
            { manaValue: { op: "eq", n: 4 } },
          ],
        },
      },
      sameAbilityAs: 0,
      targets: [],
      effect: MODES,
      resolve: null,
      text: TEXT,
    },
  ],
});
