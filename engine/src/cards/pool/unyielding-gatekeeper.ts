import { defineCard } from "../define.js";

const DISGUISE_TEXT =
  "Disguise {1}{W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT =
  "When this creature is turned face up, exile another target nonland permanent. If you controlled it, return it to the battlefield tapped. Otherwise, its controller creates a 2/2 white and blue Detective creature token.";

export default defineCard({
  name: "Unyielding Gatekeeper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 3,
  toughness: 2,
  text: `${DISGUISE_TEXT}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{1}{W}" },
  triggered: [
    {
      // "If you controlled it" is read as the ability resolves (the
      // rulings), and it returns under *your* control whoever owns it.
      // Otherwise the player who controlled it as it was exiled creates
      // the Detective.
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "other", of: "nonland-permanent" }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { controlledBy: "you" } },
        then: { kind: "flicker", target: 0, underYourControl: true, tapped: true },
        else: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "create-token", token: "Detective Token", count: 1, who: "target-controller" },
          ],
        },
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
