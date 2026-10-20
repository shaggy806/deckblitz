import { defineCard } from "../define.js";

// Rulings:
//   The last ability triggers just once for each life-gaining event.
//   Some cards refer to you having a "full party." This is true if the number of creatures
//   in your party is four.
//
// "If you have a full party" is read as the trigger resolves (rule 608.2h).

const LIFELINK_TEXT = "{W}, {T}: Another target creature you control gains lifelink until end of turn.";
const GAIN_TEXT =
  "Whenever you gain life, put a +1/+1 counter on target creature you control. If you have a full party, put three +1/+1 counters on that creature instead.";

export default defineCard({
  name: "The Destined White Mage",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${LIFELINK_TEXT}\n${GAIN_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { ifCondition: { kind: "full-party" }, then: 3, else: 1 },
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
