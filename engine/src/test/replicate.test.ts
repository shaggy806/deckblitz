import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, life, lands, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

// Replicate (rule 702.56a): "As an additional cost to cast this spell, you may
// pay [cost] any number of times" and "When you cast this spell, if a
// replicate cost was paid for it, copy it for each time its replicate cost was
// paid. If the spell has any targets, you may choose new targets for any of
// the copies." Written as a multikicker-style kicker (`keyword: "replicate"`,
// `multi: true`); one cast trigger makes every copy.

describe("replicate", () => {
  it("is offered once per affordable number of payments", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const card = toHand(game, "Pyromatics");
    const offers = game
      .legalActions(A)
      .filter((o) => o.kind === "cast-spell" && o.card === card)
      .map((o) => (o.kind === "cast-spell" ? [o.kicked === true, o.kickCount, o.kickerKeyword] : null));
    expect(offers).toEqual(
      expect.arrayContaining([
        [false, undefined, undefined],
        [true, 1, "replicate"],
        [true, 2, "replicate"],
      ]),
    );
  });

  it("Pyromatics paid twice: three spells, each 1 damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, toHand(game, "Pyromatics"), { targets: [ref(B)], kicked: true, kickCount: 2 });
    expect(life(game, B)).toBe(17);
  });

  it("unpaid, no copy", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Pyromatics"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("each copy may choose a new target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bear)];
    cast(game, toHand(game, "Pyromatics"), { targets: [ref(B)], kicked: true, kickCount: 1 });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bear].damageMarked).toBe(1);
  });

  it("copies even when the original is countered in response (the ruling)", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const train = toHand(game, "Train of Thought");
    const before = hand(game).length;
    cast(game, train, { kicked: true, kickCount: 1, settle: false });
    // The replicate trigger waits above the spell; counter the spell first.
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(train)]);
    settle(game);
    expect(zone(game, train)).toBe("graveyard");
    // The one copy drew; the countered original didn't.
    expect(hand(game).length).toBe(before - 1 + 1);
  });

  it("Thunderheads paid once: two 3/3 Weirds, exiled at the next end step", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Thunderheads"), { kicked: true, kickCount: 1 });
    expect(tokensNamed(game, "Weird Token", A)).toBe(2);
    expect(graveyard(game).length).toBe(1);
  });
});
