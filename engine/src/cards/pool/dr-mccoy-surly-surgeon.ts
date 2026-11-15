import { defineCard } from "../define.js";

// EDHREC rank 26137.

const ENTER_TEXT = "When Dr. McCoy enters, put a +1/+1 counter on another target creature you control.";
const SAVE_TEXT =
  "If another creature you control with a +1/+1 counter on it would be destroyed, instead remove all +1/+1 counters from it and all damage already dealt to it is healed.";

// A replacement (rule 614.6): it isn't destroyed, by an effect or by lethal
// damage or deathtouch (704.5g-h), and stays where it is; beside a
// regeneration shield or the like, its controller chooses (616.1).
export default defineCard({
  name: "Dr. McCoy, Surly Surgeon",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${SAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-destroyed",
        filter: {
          type: "creature",
          controlledBy: "you",
          isSource: false,
          counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } },
        },
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "remove-counter", target: 0, counter: "+1/+1", amount: "all" },
              { kind: "heal", target: 0 },
            ],
          },
        },
      },
      text: SAVE_TEXT,
    },
  ],
});
