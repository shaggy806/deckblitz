import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// "Enters or attacks" is two triggers, each the whole ability. The blight
// counters are counted as it resolves (as it last existed, if it has left —
// the ruling). For each, each opponent in turn order chooses a card to
// discard (unrevealed), a nonland permanent to sacrifice, or neither — never
// one chosen before — and once every opponent has made all of theirs, it all
// happens at once: `each-player-may`'s `rounds`, held choices released
// together, then the life lost for each "neither" as one event.
const COST_TEXT =
  "As an additional cost to cast this spell, you may sacrifice any number of nonland permanents. This spell costs {1} less to cast for each permanent sacrificed this way.";
const TRIGGER_TEXT =
  "Whenever this creature enters or attacks, put a blight counter on it. Then for each blight counter on it, each opponent loses 4 life unless that player sacrifices a nonland permanent of their choice or discards a card.";

const BLIGHT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "add-counter", target: "source", counter: "blight", amount: 1 },
    {
      kind: "each-player-may",
      who: "each-opponent",
      rounds: { countersOn: "source", counter: "blight" },
      options: [
        { sacrifice: { notTypes: ["land"] }, text: "Sacrifice a nonland permanent" },
        { discard: 1, text: "Discard a card" },
      ],
      ifDidnt: { kind: "lose-life", amount: 4, who: "that-player" },
    },
  ],
};

export default defineCard({
  name: "Rottenmouth Viper",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Snake"],
  power: 6,
  toughness: 6,
  text: `${COST_TEXT}\n${TRIGGER_TEXT}`,
  additionalCost: { sacrifice: { notTypes: ["land"] }, sacrificeCount: "x", sacrificeReduces: 1 },
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: BLIGHT, resolve: null, text: TRIGGER_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: BLIGHT, resolve: null, text: TRIGGER_TEXT },
  ],
});
