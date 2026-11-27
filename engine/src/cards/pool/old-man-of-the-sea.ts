import { defineCard } from "../define.js";

// Arabian Nights (ARN). Both powers are compared on activation and
// resolution (the target filter), then continually: the control effect ends
// the first moment the Old Man untaps or leaves, or the stolen creature's
// power goes above the Old Man's — and comparing smaller again later doesn't
// bring it back (rule 611.2b).

const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";
const STEAL_TEXT =
  "{T}: Gain control of target creature with power less than or equal to this creature's power for as long as this creature remains tapped and that creature's power remains less than or equal to this creature's power.";

const notMore = { power: { op: "lte", n: { amount: { powerOf: "source" } } } } as const;

export default defineCard({
  name: "Old Man of the Sea",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 2,
  toughness: 3,
  text: `${UNTAP_TEXT}\n${STEAL_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", ...notMore } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSourceTapped: true, whileIt: notMore },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
