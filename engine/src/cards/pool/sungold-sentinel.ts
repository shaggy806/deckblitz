import { CHOSEN_COLOR } from "../../effects.js";
import { defineCard } from "../define.js";

const EXILE = "Whenever this creature enters or attacks, exile up to one target card from a graveyard.";
const COVEN =
  "Coven — {1}{W}: Choose a color. This creature gains hexproof from that color until end of turn and can't be blocked by creatures of that color this turn. Activate only if you control three or more creatures with different powers.";

const exile = {
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }],
  effect: { kind: "exile", target: 0 },
  resolve: null,
  text: EXILE,
} as const;

export default defineCard({
  name: "Sungold Sentinel",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: `${EXILE}\n${COVEN}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      condition: { kind: "coven" },
      targets: [],
      effect: {
        kind: "choose-value",
        value: "color",
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-protection", asHexproof: true, target: "source", from: { colors: [CHOSEN_COLOR] }, duration: "end-of-turn" },
            { kind: "restrict", target: "source", restrictions: [{ kind: "cant-be-blocked", by: { colors: [CHOSEN_COLOR] } }]},
          ],
        },
      },
      resolve: null,
      text: COVEN,
    },
  ],
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...exile },
    { trigger: { on: "attacks", who: "self" }, ...exile },
  ],
});
