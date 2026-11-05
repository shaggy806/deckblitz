import { defineCard } from "../define.js";
import { CHOSEN_COLOR } from "../../effects.js";

const ABILITY =
  "{W/P}, {T}: Choose a color. Another target creature you control gains toxic 1 and hexproof from that color until end of turn. It can't be blocked by creatures of that color this turn. ({W/P} can be paid with either {W} or 2 life.)";

export default defineCard({
  name: "Skrelv, Defector Mite",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Mite"],
  power: 1,
  toughness: 1,
  toxic: 1,
  text: `Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\nSkrelv can't block.\n${ABILITY}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "Skrelv can't block." }],
  activated: [
    {
      cost: { mana: "{W/P}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "choose-value",
        value: "color",
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-toxic", target: 0, amount: 1, duration: "end-of-turn" },
            { kind: "grant-protection", asHexproof: true, target: 0, from: { colors: [CHOSEN_COLOR] }, duration: "end-of-turn" },
            { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { colors: [CHOSEN_COLOR] } },
          ],
        },
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
