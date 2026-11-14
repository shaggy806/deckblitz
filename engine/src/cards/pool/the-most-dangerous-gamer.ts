import { defineCard } from "../define.js";

// "Whenever you open an Attraction" (rule 701.51c) and "whenever you claim the
// prize of an Attraction" (702.159b) are the `opens-attraction` and
// `claims-prize` trigger events.

const ENTERS_OR_ATTACKS = "Whenever The Most Dangerous Gamer enters or attacks, open an Attraction.";
const OPENS = "Whenever you open an Attraction, put a +1/+1 counter on The Most Dangerous Gamer.";
const PRIZE = "Whenever you claim the prize of an Attraction, destroy target permanent.";

export default defineCard({
  name: "The Most Dangerous Gamer",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Gamer", "Guest"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTERS_OR_ATTACKS}\n${OPENS}\n${PRIZE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: ENTERS_OR_ATTACKS,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: ENTERS_OR_ATTACKS,
    },
    {
      trigger: { on: "event", event: "opens-attraction", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: OPENS,
    },
    {
      trigger: { on: "event", event: "claims-prize", who: "you" },
      targets: ["permanent"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: PRIZE,
    },
  ],
});
