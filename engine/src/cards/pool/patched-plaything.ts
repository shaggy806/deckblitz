import { defineCard } from "../define.js";

// EDHREC rank 21470. Carnifex Demon's enters-with -1/-1 counters, only when
// it was cast by its controller from their hand (Wakening Sun's Avatar's
// `cast` / `castFrom` source clauses); put onto the battlefield any other way,
// or cast from anywhere else, it enters a 4/3.
const ENTER_TEXT = "This creature enters with two -1/-1 counters on it if you cast it from your hand.";

export default defineCard({
  name: "Patched Plaything",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Toy"],
  power: 4,
  toughness: 3,
  keywords: ["double-strike"],
  text: `Double strike\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "-1/-1",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 2,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
