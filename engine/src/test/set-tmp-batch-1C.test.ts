/**
 * Tempest (TMP), batch 1, group C.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Rolling Thunder", () => {
  it("divides X among any number of targets, at least 1 each", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    expect(() =>
      cast(game, toHand(game, "Rolling Thunder"), { x: 1, targets: [ref(bears), ref(B)], division: [1, 1], settle: false }),
    ).toThrow();
    cast(game, toHand(game, "Rolling Thunder"), { x: 3, targets: [ref(bears), ref(B)], division: [2, 1] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });
});

describe("Dauthi Ghoul", () => {
  it("grows when another creature with shadow dies, not a creature without it", () => {
    const { game } = table();
    const ghoul = spawn(game, "Dauthi Ghoul");
    const horror = spawn(game, "Dauthi Horror", B);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(counters(game, ghoul)).toBe(0);
    destroy(game, horror);
    expect(counters(game, ghoul)).toBe(1);
  });
});

describe("Elven Warhounds", () => {
  it("puts the creature blocking it on top of its owner's library", () => {
    const { game, a, b } = table();
    const hounds = spawn(game, "Elven Warhounds");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: hounds }];
    attack(game, a, [hounds]);
    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[B].library[0]).toBe(bears);
  });
});

describe("Field of Souls", () => {
  it("makes a Spirit for a nontoken creature you own dying under an opponent, none for a token", () => {
    const { game } = table();
    spawn(game, "Field of Souls");
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(mine)]);
    expect(game.state.objects[mine].controller).toBe(B);
    destroy(game, mine);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    const spirit = named(game, "Spirit Token", A)[0];
    destroy(game, spirit);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
  });
});

describe("Apocalypse", () => {
  it("exiles every permanent and discards its caster's hand only", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const mountains = lands(game, "Mountain", 5);
    const bobHand = hand(game, B).length;
    toHand(game, "Grizzly Bears");
    cast(game, toHand(game, "Apocalypse"));
    expect(zone(game, bears)).toBe("exile");
    expect(mountains.every((m) => zone(game, m) === "exile")).toBe(true);
    expect(game.battlefield).toHaveLength(0);
    expect(hand(game, A)).toHaveLength(0);
    expect(hand(game, B)).toHaveLength(bobHand);
  });
});

describe("Tooth and Claw", () => {
  it("sacrifices two creatures to make a 3/1 Carnivore", () => {
    const { game, a } = table();
    const claw = spawn(game, "Tooth and Claw");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    a.chooseSacrificesFn = () => [one, two];
    a.choosePermanentsFn = () => [one, two];
    activate(game, claw);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    const carnivore = named(game, "Carnivore Token", A);
    expect(carnivore).toHaveLength(1);
  });
});

describe("Dirtcowl Wurm", () => {
  it("grows when an opponent plays a land, not when you do", () => {
    const { game } = table();
    const wurm = spawn(game, "Dirtcowl Wurm");
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Forest") });
    settle(game);
    expect(counters(game, wurm)).toBe(0);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    game.dispatch({ type: "play-land", player: B, card: toHand(game, "Forest", B) });
    settle(game);
    expect(counters(game, wurm)).toBe(1);
  });
});

describe("Light of Day", () => {
  it("black creatures can't block, others still can", () => {
    const { game, a } = table();
    spawn(game, "Light of Day");
    const bears = spawn(game, "Grizzly Bears");
    const corpse = spawn(game, "Walking Corpse", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [bears]);
    const can = (id: string): boolean => offer.eligible.some((e) => e.blocker === id && e.canBlock.length > 0);
    expect(can(corpse)).toBe(false);
    expect(can(theirBears)).toBe(true);
  });
});

describe("Mnemonic Sliver", () => {
  it("gives an opponent's Sliver the sacrifice-to-draw ability", () => {
    const { game } = table();
    spawn(game, "Mnemonic Sliver");
    const theirs = spawn(game, "Mnemonic Sliver", B);
    lands(game, "Island", 2, B);
    const before = hand(game, B).length;
    game.advanceUntil((s) => s.priority.holder === B);
    activate(game, theirs, 0, { player: B });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(hand(game, B)).toHaveLength(before + 1);
  });
});

describe("Soltari Lancer", () => {
  it("has first strike only while attacking", () => {
    const { game, a } = table();
    const lancer = spawn(game, "Soltari Lancer");
    expect(keywords(game, lancer).has("first-strike")).toBe(false);
    a.declareAttackersFn = () => [{ attacker: lancer, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(keywords(game, lancer).has("first-strike")).toBe(true);
  });
});
