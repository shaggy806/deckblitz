import { defineCard } from "../define.js";

// EDHREC rank 19358. Reality Fracture.
//
// "If you do" is the sacrifice actually made (Yuma, Proud Protector's shape):
// with no land to sacrifice, no Heartwoods. The tap cost may tap this
// creature itself if it has become an artifact ("artifacts you control").

const ENTER_TEXT =
  "When this creature enters, you may sacrifice a land. If you do, create two tapped Heartwood tokens. " +
  "(They're red and green artifacts with \"{T}: Add {R} or {G}.\")";
const TAP_TEXT = "Tap two untapped artifacts you control: Put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Tenured Tethermage",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "land" }, text: "Sacrifice a land" }],
        ifDid: { kind: "create-token", token: "Heartwood Token", count: 2, tapped: true },
      },
      resolve: null,
      text: "When this creature enters, you may sacrifice a land. If you do, create two tapped Heartwood tokens.",
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "artifact", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
