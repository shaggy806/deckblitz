/**
 * "Until" as a general end to an exile (rule 610.3): the second one-shot effect returns the card to
 * its previous zone right after the named event, with no trigger. A hand's card (`discard-chosen`'s
 * `untilSourceLeaves` — Kitesail Freebooter, Brain Maggot, Deep-Cavern Bat), another target leaving
 * (`exile`'s `until: { targetLeaves }` — Calix, Destiny's Hand), an opponent becoming the monarch
 * (`until: "opponent-becomes-monarch"` — Palace Jailer). And 610.3a/b: an event that has already
 * happened means nothing moves.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, attack, destroy, enter, hand, loyalty, nextTurn, pickFromZone, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** A player becomes the monarch by an effect's say-so. */
const crown = (game: Game, player: PlayerId): void => game.debugApplyEffect(player, { kind: "become-monarch" }, []);

describe("exile from a hand until the source leaves", () => {
  it("Kitesail Freebooter: a noncreature, nonland card, back in its owner's hand as it leaves, with nothing on the stack", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    const land = toHand(game, "Mountain", B);
    const bear = toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    const seen = pickFromZone(a, bolt);
    const freebooter = enter(game, "Kitesail Freebooter");
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("exile");
    expect(hand(game, B)).toEqual(expect.arrayContaining([land, bear]));
    expect(game.state.objects[bolt].exiledUntil).toMatchObject({ source: freebooter, returnTo: "hand" });

    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(freebooter)]);
    expect(zone(game, freebooter)).toBe("graveyard");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(zone(game, bolt)).toBe("hand");
    expect(hand(game, B)).toContain(bolt);
  });

  it("the card that moved on from exile doesn't come back", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    pickFromZone(a, bolt);
    const maggot = enter(game, "Brain Maggot");
    expect(zone(game, bolt)).toBe("exile");
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(maggot)]);
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, maggot)).toBe("exile");
  });

  it("Brain Maggot gone before its trigger resolves: the hand is revealed, and nothing is chosen or exiled (610.3b)", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    let asked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible.slice(0, 1);
    };
    const maggot = enter(game, "Brain Maggot", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(maggot)]);
    settle(game);
    expect(asked).toBe(0);
    expect(zone(game, bolt)).toBe("hand");
    expect(game.state.revealedThisTurn).toContain(bolt);
  });

  it("Deep-Cavern Bat: looked at, not revealed; a may; and gone, you still look (its ruling)", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    const seen = pickFromZone(a);
    enter(game, "Deep-Cavern Bat");
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("hand");
    expect(game.state.revealedThisTurn).not.toContain(bolt);

    pickFromZone(a, bolt);
    const second = enter(game, "Deep-Cavern Bat");
    expect(zone(game, bolt)).toBe("exile");
    destroy(game, second);
    expect(zone(game, bolt)).toBe("hand");

    let looked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      looked += 1;
      expect(eligible).toEqual([]);
      return [];
    };
    const third = enter(game, "Deep-Cavern Bat", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(third)]);
    settle(game);
    expect(looked).toBe(1);
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("exile until another target leaves", () => {
  function board(game: Game): { calix: ObjectId; anthem: ObjectId; giant: ObjectId } {
    return {
      calix: spawn(game, "Calix, Destiny's Hand"),
      anthem: spawn(game, "Glorious Anthem"),
      giant: spawn(game, "Hill Giant", B),
    };
  }

  it("Calix's −3: back as the enchantment leaves, though Calix is gone already", () => {
    const { game } = table();
    const { calix, anthem, giant } = board(game);
    game.state.objects[calix].counters.loyalty = 3;
    loyalty(game, calix, -3, { targets: [ref(giant), ref(anthem)] });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, calix)).toBe("graveyard");
    destroy(game, anthem);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(B);
  });

  it("Calix leaving isn't the event: the card stays until the enchantment goes", () => {
    const { game } = table();
    const { calix, anthem, giant } = board(game);
    loyalty(game, calix, -3, { targets: [ref(giant), ref(anthem)] });
    destroy(game, calix);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, anthem);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("the enchantment gone before the ability resolves: nothing is exiled (610.3a, its ruling)", () => {
    const { game } = table();
    const { calix, anthem, giant } = board(game);
    loyalty(game, calix, -3, { targets: [ref(giant), ref(anthem)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(anthem)]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("a token exiled this way is gone for good (rule 111.7)", () => {
    const { game } = table();
    const { calix, anthem } = board(game);
    const token = spawn(game, "Grizzly Bears", B);
    game.state.objects[token].isToken = true;
    loyalty(game, calix, -3, { targets: [ref(token), ref(anthem)] });
    destroy(game, anthem);
    expect(game.state.zones.shared.battlefield).not.toContain(token);
  });
});

describe("exile until an opponent becomes the monarch", () => {
  it("Palace Jailer: you're the monarch, the creature's gone, and its leaving changes nothing (the ruling)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const jailer = enter(game, "Palace Jailer");
    expect(game.state.monarch).toBe(A);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, jailer);
    expect(zone(game, giant)).toBe("exile");
  });

  it("combat damage to the monarch brings it back, under its owner, any opponent doing it", () => {
    const { game, a, c } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    const bear = spawn(game, "Grizzly Bears", C);
    pickTargets(a, giant);
    enter(game, "Palace Jailer");
    nextTurn(game);
    nextTurn(game);
    attack(game, c, [bear], A);
    settle(game);
    expect(game.state.monarch).toBe(C);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(B);
  });

  it("an opponent who's the monarch already doesn't count: it takes a new one (the ruling)", () => {
    const { game, a } = table({ players: 3 });
    crown(game, B);
    const giant = spawn(game, "Hill Giant", C);
    pickTargets(a, giant);
    enter(game, "Palace Jailer");
    expect(zone(game, giant)).toBe("exile");
    expect(game.state.monarch).toBe(A);
    crown(game, A);
    expect(zone(game, giant)).toBe("exile");
    crown(game, B);
    expect(game.state.monarch).toBe(B);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("two Jailers: each card waits on its own exiler's opponents", () => {
    const { game, a, b } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Palace Jailer");
    const bear = spawn(game, "Grizzly Bears", A);
    pickTargets(b, bear);
    enter(game, "Palace Jailer", B);
    // Bob became the monarch: Alice's opponent, so his Giant is back.
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bear)).toBe("exile");
    crown(game, A);
    // Alice is Bob's opponent: her Bears are back too.
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("an opponent becoming the monarch with the trigger on the stack: nothing is exiled (610.3b)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Palace Jailer", A, { settle: false });
    crown(game, B);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });
});
