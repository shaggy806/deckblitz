import { defineCard } from "../define.js";
import { partnerWithTrigger } from "../helpers.js";

// EDHREC rank 12337. The counter is chosen as the ability resolves.

const PARTNER = "Blue, Loyal Raptor";
const COUNTER_TEXT =
  "{T}: Put your choice of a reach, menace, trample, or haste counter on target Dinosaur. Activate only as a sorcery.";
const counterMode = (counter: "reach" | "menace" | "trample" | "haste", text: string) => ({
  text,
  effect: { kind: "add-counter", target: 0, counter, amount: 1 } as const,
});

export default defineCard({
  name: "Owen Grady, Raptor Trainer",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Scientist"],
  power: 3,
  toughness: 2,
  pairing: { kind: "partner-with", name: PARTNER },
  text: `Partner with ${PARTNER}\n${COUNTER_TEXT}`,
  triggered: [partnerWithTrigger(PARTNER)],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Dinosaur" } }],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          counterMode("reach", "Reach counter"),
          counterMode("menace", "Menace counter"),
          counterMode("trample", "Trample counter"),
          counterMode("haste", "Haste counter"),
        ],
      },
      resolve: null,
      text: COUNTER_TEXT,
      sorcerySpeed: true,
    },
  ],
});
