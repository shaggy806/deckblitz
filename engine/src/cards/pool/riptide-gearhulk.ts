import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC 3536 (batch 315). One optional slot per opponent's seat, the
// permanents put into their owners' libraries third from the top together
// (`put-on-libraries`' `fromTop`): beneath the top two cards, or on the
// bottom of a library with fewer. Two that share an owner are theirs to
// arrange there (rule 401.4); a token goes and ceases to exist (111.8).
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const ENTERS_TEXT =
  "When this creature enters, for each opponent, put up to one target nonland permanent that player controls into its owner's library third from the top.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

export default defineCard({
  name: "Riptide Gearhulk",
  manaCost: "{1}{W}{W}{U}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 5,
  keywords: ["double-strike"],
  text: `Double strike\n${PROWESS_TEXT}\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: { fromTop: 3 } },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
