import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 16132.
//
// The count is read as each trigger resolves: every attacking (blocking)
// creature but Márton himself, whoever controls it.

const ATTACK_TEXT =
  "Whenever Márton Stromgald attacks, other attacking creatures get +1/+1 until end of turn for each attacking creature other than Márton Stromgald.";
const BLOCK_TEXT =
  "Whenever Márton Stromgald blocks, other blocking creatures get +1/+1 until end of turn for each blocking creature other than Márton Stromgald.";

const others = (filter: { readonly attacking: true } | { readonly blocking: true }) =>
  ({ countOf: { type: "creature", ...filter }, excludeSelf: true }) as const;

export default defineCard({
  name: "Márton Stromgald",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: `${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: others({ attacking: true }),
        toughness: others({ attacking: true }),
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", blocking: true },
        power: others({ blocking: true }),
        toughness: others({ blocking: true }),
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
});
