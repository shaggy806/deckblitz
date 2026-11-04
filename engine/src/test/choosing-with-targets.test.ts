/**
 * A choice made as a spell resolves beside its targets: among the targets
 * themselves, by you or by their controller (Aerith Rescue Mission, Wicked
 * Slumber, Trial of Agony), or of something else, the targets still there for
 * what follows (`choose-permanents`' `keepTargets` — Crush Underfoot).
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  cast,
  counters,
  destroy,
  grant,
  lands,
  life,
  pickPermanents,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const BEARS = "Grizzly Bears"; // 2/2
const GIANT = "Hill Giant"; // 3/3 Giant
const STONE_GIANT = "Stone Giant"; // 3/4 Giant
const DREADMAW = "Colossal Dreadmaw"; // 6/6

describe("Wicked Slumber", () => {
  it("taps both; each counter goes where you choose, both on one if you like", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, BEARS, B);
    const giant = spawn(game, GIANT, B);
    const seen = pickPermanents(a, giant);
    cast(game, toHand(game, "Wicked Slumber"), { targets: [ref(bears), ref(giant)] });
    expect(seen.offered).toEqual([bears, giant]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(2);
    expect(counters(game, bears, "stun")).toBe(0);
  });

  it("one each, asked one at a time", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, BEARS, B);
    const giant = spawn(game, GIANT, B);
    const picks = [bears, giant];
    a.choosePermanentsFn = () => [picks.shift() ?? giant];
    cast(game, toHand(game, "Wicked Slumber"), { targets: [ref(bears), ref(giant)] });
    expect(counters(game, bears, "stun")).toBe(1);
    expect(counters(game, giant, "stun")).toBe(1);
  });

  it("with one target illegal, both go on the other, unasked (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, BEARS, B);
    const giant = spawn(game, GIANT, B);
    const seen = pickPermanents(a, giant);
    cast(game, toHand(game, "Wicked Slumber"), { targets: [ref(bears), ref(giant)], settle: false });
    destroy(game, bears);
    expect(seen.offered).toEqual([]);
    expect(counters(game, giant, "stun")).toBe(2);
  });

  it("no targets at all is a legal cast, and does nothing", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, BEARS, B);
    cast(game, toHand(game, "Wicked Slumber"), { targets: [] });
    expect(game.state.objects[bears].tapped).toBeFalsy();
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("has convoke: its offer may be paid by tapping your creatures", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const merfolk = spawn(game, "Merfolk Looter", A);
    const spell = toHand(game, "Wicked Slumber");
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "cast-spell" && o.card === spell);
    expect(offer !== undefined && offer.kind === "cast-spell" ? offer.convoke?.candidates : []).toEqual([merfolk]);
  });

  it("the stun counter holds it through its controller's untap step", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, BEARS, B);
    pickPermanents(a, bears);
    cast(game, toHand(game, "Wicked Slumber"), { targets: [ref(bears)] });
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});

describe("Aerith Rescue Mission", () => {
  it("first mode: three 1/1 colorless Heroes", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Aerith Rescue Mission"), { modes: [0] });
    expect(tokensNamed(game, "Hero Token (Black Mage's Rod)", A)).toBe(3);
  });

  it("second mode: taps up to three, a stun counter on the one you choose as it resolves", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, BEARS, B);
    const giant = spawn(game, GIANT, B);
    const maw = spawn(game, DREADMAW, B);
    const seen = pickPermanents(a, maw);
    cast(game, toHand(game, "Aerith Rescue Mission"), { modes: [1], targets: [ref(bears), ref(giant), ref(maw)] });
    expect(seen.offered).toEqual([bears, giant, maw]);
    for (const id of [bears, giant, maw]) expect(game.state.objects[id].tapped).toBe(true);
    expect(counters(game, maw, "stun")).toBe(1);
    expect(counters(game, giant, "stun")).toBe(0);
  });

  it("second mode with one target left: it gets the counter, unasked", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, BEARS, B);
    const giant = spawn(game, GIANT, B);
    const seen = pickPermanents(a, bears);
    cast(game, toHand(game, "Aerith Rescue Mission"), { modes: [1], targets: [ref(bears), ref(giant)], settle: false });
    destroy(game, bears);
    expect(seen.offered).toEqual([]);
    expect(counters(game, giant, "stun")).toBe(1);
  });
});

describe("Trial of Agony", () => {
  it("that player chooses: 5 damage to it, and the other can't block", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, BEARS, B);
    const maw = spawn(game, DREADMAW, B);
    let aliceAsked = false;
    a.choosePermanentsFn = () => {
      aliceAsked = true;
      return [];
    };
    pickPermanents(b, maw);
    cast(game, toHand(game, "Trial of Agony"), { targets: [ref(bears), ref(maw)] });
    expect(aliceAsked).toBe(false);
    expect(game.state.objects[maw].damageMarked).toBe(5);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(game.characteristics(bears).restrictions).toContain("cant-block");
    expect(game.characteristics(maw).restrictions).not.toContain("cant-block");
  });

  it("two creatures of one opponent, not two opponents' or yours", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 1);
    const bobs = spawn(game, BEARS, B);
    const carols = spawn(game, BEARS, C);
    const mine = spawn(game, BEARS, A);
    const spell = toHand(game, "Trial of Agony");
    expect(() => cast(game, spell, { targets: [ref(bobs), ref(carols)] })).toThrow();
    expect(() => cast(game, spell, { targets: [ref(mine), ref(bobs)] })).toThrow();
  });

  it("with one target illegal, the other must be chosen, and is dealt the 5 (the ruling)", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, BEARS, B);
    const maw = spawn(game, DREADMAW, B);
    const seen = pickPermanents(b, bears);
    cast(game, toHand(game, "Trial of Agony"), { targets: [ref(bears), ref(maw)], settle: false });
    destroy(game, bears);
    expect(seen.offered).toEqual([]);
    expect(game.state.objects[maw].damageMarked).toBe(5);
  });
});

describe("Crush Underfoot", () => {
  it("the Giant you choose as it resolves deals its power to the target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const hill = spawn(game, GIANT, A);
    const stone = spawn(game, STONE_GIANT, A);
    const theirs = spawn(game, DREADMAW, B);
    const notAGiant = spawn(game, BEARS, A);
    const seen = pickPermanents(a, stone);
    cast(game, toHand(game, "Crush Underfoot"), { targets: [ref(theirs)] });
    expect(seen.offered).toEqual([hill, stone]);
    expect(seen.offered).not.toContain(notAGiant);
    expect(game.state.objects[theirs].damageMarked).toBe(3);
    expect(game.state.objects[stone].damageMarked).toBe(0);
  });

  it("the Giant is the one dealing it: its lifelink gains life", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, GIANT, A);
    grant(game, giant, "lifelink");
    const theirs = spawn(game, DREADMAW, B);
    pickPermanents(a, giant);
    const before = life(game, A);
    cast(game, toHand(game, "Crush Underfoot"), { targets: [ref(theirs)] });
    expect(life(game, A)).toBe(before + 3);
  });

  it("with no Giant it finishes with no effect", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const theirs = spawn(game, DREADMAW, B);
    cast(game, toHand(game, "Crush Underfoot"), { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].damageMarked).toBe(0);
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("its target can be the Giant chosen: it deals itself its power", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, GIANT, A);
    pickPermanents(a, giant);
    cast(game, toHand(game, "Crush Underfoot"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});
