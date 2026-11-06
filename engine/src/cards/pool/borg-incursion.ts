import { defineCard } from "../define.js";

export default defineCard({
  name: "Borg Incursion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Create two 1/1 colorless Borg artifact creature tokens, then artifact creatures you control gain protection from the color of your choice until end of turn. (They can't be blocked, targeted, dealt damage, enchanted, or equipped by anything of that color.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Borg Token", count: 2 },
      {
        kind: "grant-protection",
        filter: { types: ["artifact", "creature"], controlledBy: "you" },
        from: { choose: "color" },
        duration: "end-of-turn",
      },
    ],
  },
});
