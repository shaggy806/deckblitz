import { describe, expect, it } from "vitest";
import { A, B, C, cast, lands, life, ref, table, toHand } from "./harness.js";

describe("R3 group D rechecks", () => {
  it("Tempt with Mayhem: an accepting opponent controls and retargets their copy; you copy once plus once per acceptor", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Mountain", 4);
    // Bob accepts and aims his copy at alice; carol declines; alice keeps bob.
    b.chooseModesFn = () => [0];
    b.chooseTargetsFn = () => [ref(A)];
    c.chooseModesFn = () => [];
    a.chooseModesFn = () => [0];
    a.chooseTargetsFn = () => [ref(B)];
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Tempt with Mayhem"), { targets: [ref(bolt)] });
    // Bob's copy hits alice; the original and alice's two copies hit bob.
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(11);
    expect(life(game, C)).toBe(20);
  });
});
