/**
 * The set walk, batch 58, part a (2026-10-11): Marvel Super Heroes. Written
 * on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Tony Stark // The Invincible Iron Man", () => {
  it("takes only an artifact from the top four into the hand", () => {
    const { game, a } = table();
    const tony = spawn(game, "Tony Stark");
    const ring = toLibrary(game, "Sol Ring");
    toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 1);
    const seen = pickFromZone(a, ring);
    activate(game, tony, 0);
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("hand");
  });

  it("transformed, puts an Equipment from the hand onto the battlefield attached to Iron Man", () => {
    const { game, a } = table();
    const tony = spawn(game, "Tony Stark");
    lands(game, "Island", 5);
    lands(game, "Mountain", 1);
    activate(game, tony, 1);
    expect(game.state.objects[tony].face).toBe(1);
    const blade = toHand(game, "Bonesplitter");
    pickFromZone(a, blade);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, blade)).toBe("battlefield");
    expect(game.state.objects[blade].attachedTo).toBe(tony);
    expect(pt(game, tony)).toEqual({ power: 7, toughness: 5 });
  });

  it("puts a non-Equipment artifact onto the battlefield without attaching it", () => {
    const { game, a } = table();
    const tony = spawn(game, "Tony Stark");
    lands(game, "Island", 5);
    lands(game, "Mountain", 1);
    activate(game, tony, 1);
    const ring = toHand(game, "Sol Ring");
    pickFromZone(a, ring);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[ring].attachedTo ?? null).toBeNull();
  });
});

describe("H.E.R.B.I.E. Scout Unit", () => {
  it("draws, then puts a land from the hand onto the battlefield tapped", () => {
    const { game, a } = table();
    const before = hand(game).length;
    let put: ObjectId | undefined;
    a.chooseFromZoneFn = (_view, eligible) => {
      put = eligible[0];
      return [eligible[0]];
    };
    enter(game, "H.E.R.B.I.E. Scout Unit");
    expect(put).toBeDefined();
    expect(zone(game, put as ObjectId)).toBe("battlefield");
    expect(game.state.objects[put as ObjectId].tapped).toBe(true);
    expect(hand(game).length).toBe(before);
  });
});

describe("Kang, Temporal Tyrant", () => {
  it("connives as he attacks, and the connive's draw is the second card that drains", () => {
    const { game, a } = table();
    // Alice drew her first card of the turn in her draw step.
    const kang = spawn(game, "Kang, Temporal Tyrant");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    attack(game, a, [kang]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, kang)).toBe(1);
    expect(life(game, B)).toBe(20 - 1 - 4);
    expect(life(game, A)).toBe(21);
  });
});

describe("The Sentry, Golden Guardian", () => {
  it("has the target opponent create The Void, a legendary 5/5 flier", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "The Sentry, Golden Guardian");
    const [voidToken] = named(game, "The Void", B);
    expect(voidToken).toBeDefined();
    expect(named(game, "The Void", A)).toHaveLength(0);
    expect(supertypes(game, voidToken)).toContain("legendary");
    expect(pt(game, voidToken)).toEqual({ power: 5, toughness: 5 });
    expect([...keywords(game, voidToken)]).toEqual(expect.arrayContaining(["flying", "indestructible"]));
  });
});

describe("Doctor Doom", () => {
  it("makes two Doombots, which give him indestructible", () => {
    const { game } = table();
    const doom = enter(game, "Doctor Doom");
    expect(tokensNamed(game, "Doombot", A)).toBe(2);
    expect(keywords(game, doom).has("indestructible")).toBe(true);
  });

  it("has indestructible only while you control an artifact creature", () => {
    const { game } = table();
    const doom = spawn(game, "Doctor Doom");
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter", B);
    expect(keywords(game, doom).has("indestructible")).toBe(false);
    spawn(game, "Ornithopter");
    expect(keywords(game, doom).has("indestructible")).toBe(true);
  });

  it("draws a card and loses 1 life at your end step", () => {
    const { game } = table();
    spawn(game, "Doctor Doom");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Epic Fight", () => {
  it("doubles the creature's power and toughness before it fights", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const fight = toHand(game, "Epic Fight");
    cast(game, fight, { modes: [0, 1], targets: [ref(bears), ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Red Hulk", () => {
  it("gets a counter when dealt damage, then deals damage equal to his counters to another target", () => {
    const { game, a } = table();
    const hulk = spawn(game, "Red Hulk");
    const pinger = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [B]);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(hulk)], { source: pinger });
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).not.toContain(hulk);
    expect(counters(game, hulk)).toBe(1);
    expect(life(game, B)).toBe(19);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(hulk)], { source: pinger });
    settle(game);
    expect(counters(game, hulk)).toBe(2);
    expect(life(game, B)).toBe(17);
  });

  it("has no reflexive trigger when he isn't there to take the counter", () => {
    const { game, a } = table();
    const hulk = spawn(game, "Red Hulk");
    const pinger = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [B]);
    game.debugApplyEffect(B, { kind: "damage", amount: 7, target: 0 }, [ref(hulk)], { source: pinger });
    settle(game);
    expect(zone(game, hulk)).toBe("graveyard");
    expect(seen.asked).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});

describe("Multiversal Incursion", () => {
  it("copies each nontoken creature you control, not legendary", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    spawn(game, "Grizzly Bears");
    spawn(game, "Doombot");
    spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Multiversal Incursion"));
    const isamarus = named(game, "Isamaru, Hound of Konda", A);
    expect(isamarus).toHaveLength(2);
    const copy = isamarus.find((id) => id !== isamaru) as ObjectId;
    expect(game.state.objects[copy].isToken).toBe(true);
    expect(supertypes(game, copy)).not.toContain("legendary");
    expect(zone(game, isamaru)).toBe("battlefield");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
    expect(tokensNamed(game, "Doombot", A)).toBe(1);
    expect(named(game, "Hill Giant", A)).toHaveLength(0);
  });
});
