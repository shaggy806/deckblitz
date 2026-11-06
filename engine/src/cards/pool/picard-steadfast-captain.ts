import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const TEXT = "Whenever Picard enters or attacks, put two +1/+1 counters on another target creature you control.";

const counters = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [{ kind: "other", of: "creature-you-control" }],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Picard, Steadfast Captain",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [counters({ on: "enters-battlefield", who: "self" }), counters({ on: "attacks", who: "self" })],
});
