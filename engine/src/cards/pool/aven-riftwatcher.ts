import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// Planar Chaos (PLC). "Enters or leaves" is two triggers (Candlekeep Sage).
const LIFE = "When this creature enters or leaves the battlefield, you gain 2 life.";
const GAIN = { kind: "gain-life", amount: 2 } as const;

export default defineCard({
  name: "Aven Riftwatcher",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Rebel", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nVanishing 3 (This creature enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n${LIFE}`,
  static: [...vanishing(3).static],
  triggered: [
    ...vanishing(3).triggered,
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: GAIN, resolve: null, text: LIFE },
    { trigger: { on: "leaves-battlefield", who: "self" }, targets: [], effect: GAIN, resolve: null, text: LIFE },
  ],
});
